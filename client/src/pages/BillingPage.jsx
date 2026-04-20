import { useState, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { generateBillPDF } from '../utils/pdf';

const BillingPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi' | 'credit'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBill, setSuccessBill] = useState(null);

  const GST_RATE = 18;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/products', { params: { search: val, limit: 10 } });
        setSearchResults(data.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const addToCart = (product) => {
    if (Number(product.stock_qty) <= 0) {
      alert('Out of stock!');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.qty >= product.stock_qty) return prev;
        return prev.map(item => item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { product_id: product.id, name: product.name, unit_price: product.sell_price, qty: 1, max_qty: product.stock_qty }];
      }
    });
    setSearch('');
    setSearchResults([]);
  };

  const updateCartQty = (productId, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.product_id !== productId));
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        if (qty > item.max_qty) return item;
        return { ...item, qty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const calculatedSubtotal = cart.reduce((sum, item) => sum + (Number(item.unit_price) * item.qty), 0);
  const finalDiscount = Number(discount || 0);
  const gstAmount = ((calculatedSubtotal - finalDiscount) * GST_RATE) / 100;
  const finalTotal = Math.max(0, calculatedSubtotal - finalDiscount + gstAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setError('');
    setLoading(true);
    try {
      const payload = {
        items: cart.map(c => ({ product_id: c.product_id, qty: c.qty })),
        total_amount: Math.round(finalTotal),
        discount: finalDiscount,
        payment_method: paymentMethod,
        customer_name: customerName || 'Walk-in Customer'
      };
      const { data } = await api.post('/bills', payload);
      setSuccessBill({
        ...data.data,
        items: cart.map(c => ({ ...c, subtotal: c.unit_price * c.qty }))
      });
      setCart([]);
      setDiscount(0);
      setCustomerName('');
      setSearch('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bill. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successBill) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', backgroundColor: 'var(--color-surface)', border: '1px solid rgba(28,20,16,0.08)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>RECEIPT GENERATED</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', marginBottom: '32px', color: 'var(--color-muted)' }}>RECEIPT NO: {successBill.bill_number}</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-outline" onClick={() => generateBillPDF(successBill, user)}>DOWNLOAD PDF</button>
          <button className="btn btn-primary" onClick={() => setSuccessBill(null)}>START NEW BILL</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '32px', height: '100%', alignItems: 'flex-start' }}>
      
      {/* Left Panel: Cart */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '16px', margin: 0 }}>NEW ENTRY</h1>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search products by Name or SKU..."
            value={search}
            onChange={handleSearchChange}
          />
          {search && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--color-surface)', border: '1px solid rgba(28,20,16,0.08)', zIndex: 10, maxHeight: '300px', overflowY: 'auto' }}>
              {isSearching ? <div style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>SEARCHING...</div> :
               searchResults.length > 0 ? (
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {searchResults.map(p => (
                     <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(28,20,16,0.04)', cursor: 'pointer' }} onClick={() => addToCart(p)}>
                       <div>
                         <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>{p.name}</p>
                         <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>Stock: {p.stock_qty} | ₹{p.sell_price}</p>
                       </div>
                       <button style={{ backgroundColor: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', padding: '0 12px', cursor: 'pointer' }}>ADD</button>
                     </div>
                   ))}
                 </div>
               ) : <div style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>NO ITEMS FOUND</div>
              }
            </div>
          )}
        </div>

        {/* Ledger Table */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(28,20,16,0.08)', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,20,16,0.08)', backgroundColor: 'rgba(28,20,16,0.02)' }}>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px' }}>ITEM</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px', textAlign: 'center' }}>QTY</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px', textAlign: 'right' }}>PRICE</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px', textAlign: 'right' }}>TOTAL</th>
                <th style={{ padding: '16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>LEDGER IS EMPTY</td></tr>
              ) : (
                cart.map(item => (
                  <tr key={item.product_id} style={{ borderBottom: '1px solid rgba(28,20,16,0.04)' }}>
                    <td style={{ padding: '16px', fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>{item.name}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', border: '1px solid rgba(28,20,16,0.2)' }}>
                        <button style={{ border: 'none', background: 'transparent', padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }} onClick={() => updateCartQty(item.product_id, item.qty - 1)}>-</button>
                        <input type="number" readOnly value={item.qty} style={{ borderTop: 'none', borderBottom: 'none', borderLeft: '1px solid rgba(28,20,16,0.2)', borderRight: '1px solid rgba(28,20,16,0.2)', width: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', background: 'transparent' }} />
                        <button style={{ border: 'none', background: 'transparent', padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }} onClick={() => updateCartQty(item.product_id, item.qty + 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{item.unit_price}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{item.unit_price * item.qty}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                       <button style={{ border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '16px' }} onClick={() => removeFromCart(item.product_id)}>&times;</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Right Panel: Checkout */}
      <div className="stat-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
        
        <div>
          <label className="input-label">CUSTOMER / PARTY NAME</label>
          <input type="text" className="input-field" placeholder="E.g. Ramesh" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </div>

        <div>
           <label className="input-label">DISCOUNT (₹)</label>
           <input type="number" className="input-field" value={discount} onChange={e => setDiscount(e.target.value)} />
        </div>

        <div>
          <label className="input-label">PAYMENT MODE</label>
          <div style={{ display: 'flex', border: '1px solid rgba(28,20,16,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            {['cash', 'upi', 'credit'].map(mode => (
              <button 
                key={mode}
                style={{ 
                  flex: 1, padding: '12px', border: 'none', background: paymentMethod === mode ? 'var(--color-primary-dark)' : 'transparent', color: paymentMethod === mode ? 'var(--color-surface)' : 'var(--color-primary-dark)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' 
                }}
                onClick={() => setPaymentMethod(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '2px dashed rgba(28,20,16,0.1)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
            <span style={{ color: 'var(--color-muted)' }}>SUBTOTAL</span>
            <span>₹{calculatedSubtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
            <span style={{ color: 'var(--color-muted)' }}>DISCOUNT</span>
            <span style={{ color: 'var(--color-danger)' }}>- ₹{finalDiscount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
            <span style={{ color: 'var(--color-muted)' }}>GST (18%)</span>
            <span>₹{gstAmount.toFixed(1)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(28,20,16,0.2)', paddingTop: '16px', marginTop: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold' }}>TOTAL</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--color-primary-dark)' }}>₹{Math.round(finalTotal)}</span>
          </div>
        </div>

        {error && <p style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{error}</p>}
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: 'auto', padding: '24px 0', fontSize: '14px' }}
          disabled={cart.length === 0 || loading}
          onClick={handleCheckout}
        >
          {loading ? 'PROCESSING...' : 'GENERATE BILL'}
        </button>

      </div>
    </div>
  );
};

export default BillingPage;
