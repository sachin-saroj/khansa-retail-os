import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '',
    buy_price: '', sell_price: '',
    stock_qty: '', low_stock_threshold: '5',
    unit: 'pcs'
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { page, limit: 12, search, category }
      });
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '', sku: '', category: '',
      buy_price: '', sell_price: '',
      stock_qty: '', low_stock_threshold: '5',
      unit: 'pcs'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, sku: product.sku || '', category: product.category || '',
      buy_price: product.buy_price, sell_price: product.sell_price,
      stock_qty: product.stock_qty, low_stock_threshold: product.low_stock_threshold,
      unit: product.unit || 'pcs'
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sell_price || !formData.stock_qty) {
      setError('Name, Sell Price, and Qty are required');
      return;
    }
    setError('');
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const calculateMargin = (buy, sell) => {
    if (!buy || !sell || buy == 0) return '-';
    const margin = ((sell - buy) / sell) * 100;
    return margin.toFixed(1) + '%';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Bar: Search, Category, Action */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <input
          type="text"
          className="input-field"
          style={{ flex: 1 }}
          placeholder="SEARCH PRODUCTS..."
          value={search}
          onChange={handleSearch}
        />
        <select 
          className="input-field"
          style={{ width: '220px', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase' }}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">ALL CATEGORIES</option>
          <option value="snacks">SNACKS</option>
          <option value="beverages">BEVERAGES</option>
          <option value="groceries">GROCERIES</option>
          <option value="personal_care">PERSONAL CARE</option>
          <option value="other">OTHER</option>
        </select>
        <button className="btn btn-primary" onClick={openAddModal}>
          ADD PRODUCT
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="spinner" style={{ color: 'var(--color-gold)' }}></span>
        </div>
      ) : (
        <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,20,16,0.08)' }}>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px' }}>PRODUCT NAME</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px' }}>SKU</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px' }}>CATEGORY</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px' }}>STOCK</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px' }}>BUY PRICE</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px' }}>SELL PRICE</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px' }}>MARGIN%</th>
                <th style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', padding: '16px 24px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                    NO PRODUCTS FOUND.
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => {
                  const isLowStock = Number(p.stock_qty) <= Number(p.low_stock_threshold);
                  const isAlt = idx % 2 === 1;
                  return (
                    <tr key={p.id} style={{ backgroundColor: isAlt ? 'rgba(28,20,16,0.02)' : 'transparent', borderBottom: '1px solid rgba(28,20,16,0.04)' }}>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>{p.name}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)' }}>{p.sku || '-'}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase' }}>{p.category || '-'}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: '14px', color: isLowStock ? 'var(--color-warning)' : 'inherit', fontWeight: isLowStock ? 'bold' : 'normal' }}>
                        {p.stock_qty} {p.unit}
                      </td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)' }}>₹{p.buy_price || 0}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold' }}>₹{p.sell_price}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-success)' }}>{calculateMargin(p.buy_price, p.sell_price)}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline" style={{ minHeight: '32px', padding: '0 12px' }} onClick={() => openEditModal(p)}>EDIT</button>
                          <button style={{ minHeight: '32px', padding: '0 12px', border: 'none', background: 'transparent', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }} onClick={() => handleDelete(p.id)}>DELETE</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button className="btn btn-outline" style={{ minHeight: '36px', padding: '0 16px' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>PREV</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', alignItems: 'center', padding: '0 16px' }}>PAGE {page} OF {totalPages}</span>
          <button className="btn btn-outline" style={{ minHeight: '36px', padding: '0 16px' }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>NEXT</button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '24px' }}>
              {editingProduct ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
            </h2>

             {error && <div style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '24px' }}>{error}</div>}

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
               <div>
                 <label className="input-label">NAME *</label>
                 <input type="text" className="input-field" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                   <label className="input-label">SKU</label>
                   <input type="text" className="input-field" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} />
                 </div>
                 <div>
                   <label className="input-label">CATEGORY</label>
                   <select className="input-field" value={formData.category} onChange={e => handleChange('category', e.target.value)}>
                     <option value="">SELECT</option>
                     <option value="snacks">SNACKS</option>
                     <option value="beverages">BEVERAGES</option>
                     <option value="groceries">GROCERIES</option>
                   </select>
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                   <label className="input-label">BUY PRICE</label>
                   <input type="number" className="input-field" value={formData.buy_price} onChange={e => handleChange('buy_price', e.target.value)} />
                 </div>
                 <div>
                   <label className="input-label">SELL PRICE *</label>
                   <input type="number" className="input-field" value={formData.sell_price} onChange={e => handleChange('sell_price', e.target.value)} />
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                   <label className="input-label">STOCK QTY *</label>
                   <input type="number" className="input-field" value={formData.stock_qty} onChange={e => handleChange('stock_qty', e.target.value)} />
                 </div>
                 <div>
                   <label className="input-label">UNIT</label>
                    <select className="input-field" value={formData.unit} onChange={e => handleChange('unit', e.target.value)}>
                      <option value="pcs">PCS</option>
                      <option value="kg">KG</option>
                      <option value="g">G</option>
                      <option value="ltr">LTR</option>
                    </select>
                 </div>
               </div>
             </div>

             <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>CANCEL</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>SAVE PRODUCT</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsPage;
