import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isNewCustomerModal, setIsNewCustomerModal] = useState(false);
  const [isDetailsModal, setIsDetailsModal] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Forms
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', address: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', notes: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers');
      setCustomers(data.data);
    } catch (err) {
      setError('Failed to load Udhari book');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateCustomer = async () => {
    if (!newCustomerForm.name) {
      alert('Name is required');
      return;
    }
    try {
      await api.post('/customers', newCustomerForm);
      setIsNewCustomerModal(false);
      setNewCustomerForm({ name: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const openCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModal(true);
    try {
      const { data } = await api.get(`/customers/${customer.id}`);
      setSelectedCustomer(data.data);
      setTransactions(data.data.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  const recordPayment = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      alert('Valid amount required');
      return;
    }
    setPaymentLoading(true);
    try {
      await api.post(`/customers/${selectedCustomer.id}/transactions`, {
        type: 'received',
        amount: paymentForm.amount,
        notes: paymentForm.notes || 'Manual Payment Received'
      });
      setPaymentForm({ amount: '', notes: '' });
      openCustomerDetails(selectedCustomer);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-danger)', fontSize: '36px', lineHeight: 1.2, margin: 0 }}>
            UDHARI BOOK
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: '8px' }}>
            LEDGER & ACCOUNTS
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewCustomerModal(true)}>
          ADD CUSTOMER
        </button>
      </div>

      {error ? (
        <div style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{error}</div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="spinner" style={{ color: 'var(--color-danger)' }}></span>
        </div>
      ) : customers.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '64px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>NO CUSTOMERS FOUND.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {customers.map(c => {
            const balance = Number(c.balance);
            const isDue = balance > 0;
            return (
              <div 
                key={c.id} 
                className="stat-card" 
                style={{ borderTop: `3px solid ${isDue ? 'var(--color-danger)' : 'var(--color-success)'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
                onClick={() => openCustomerDetails(c)}
              >
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--color-primary-dark)', margin: 0, textTransform: 'uppercase' }}>{c.name}</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-muted)' }}>
                  {c.phone ? `TEL: ${c.phone}` : 'NO TELEPHONE'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(28,20,16,0.08)' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)', letterSpacing: '1px' }}>TOTAL BALANCE</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 'bold', color: isDue ? 'var(--color-danger)' : 'var(--color-success)', margin: 0 }}>
                    {balance > 0 ? `₹${Math.abs(balance)} DUE` : balance < 0 ? `₹${Math.abs(balance)} ADV` : 'SETTLED'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px', textTransform: 'uppercase' }}>New Customer</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1px', marginBottom: '24px', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '16px' }}>CLIENT REGISTRY</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">NAME *</label>
                <input type="text" className="input-field" value={newCustomerForm.name} onChange={e => setNewCustomerForm({...newCustomerForm, name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">PHONE NUMBER</label>
                <input type="tel" className="input-field" maxLength={10} value={newCustomerForm.phone} onChange={e => setNewCustomerForm({...newCustomerForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="input-label">ADDRESS</label>
                <input type="text" className="input-field" value={newCustomerForm.address} onChange={e => setNewCustomerForm({...newCustomerForm, address: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsNewCustomerModal(false)}>CANCEL</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreateCustomer}>ADD CLIENT</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details & Payment Modal */}
      {isDetailsModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            <div style={{ padding: '32px', borderBottom: '1px solid rgba(28,20,16,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', margin: 0, textTransform: 'uppercase' }}>{selectedCustomer.name}</h2>
                {selectedCustomer.phone && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '1px', marginTop: '8px' }}>TEL: {selectedCustomer.phone}</p>}
              </div>
              <button style={{ background: 'transparent', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '24px', cursor: 'pointer', color: 'var(--color-muted)' }} onClick={() => setIsDetailsModal(false)}>×</button>
            </div>

            <div style={{ padding: '32px', backgroundColor: Number(selectedCustomer.balance) > 0 ? 'rgba(231, 76, 60, 0.05)' : 'rgba(28,20,16,0.02)', borderBottom: '1px solid rgba(28,20,16,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="input-label" style={{ display: 'block', marginBottom: '8px' }}>TOTAL LEDGER BALANCE</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 'bold', color: Number(selectedCustomer.balance) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  ₹{Math.abs(Number(selectedCustomer.balance))} <span style={{ fontSize: '14px', opacity: 0.8 }}>{Number(selectedCustomer.balance) > 0 ? 'DUE' : Number(selectedCustomer.balance) < 0 ? 'ADV' : ''}</span>
                </span>
              </div>
              {Number(selectedCustomer.balance) > 0 && selectedCustomer.phone && (
                <button 
                  className="btn btn-outline"
                  style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                  onClick={() => {
                    const msg = encodeURIComponent(`Namaste ${selectedCustomer.name}, aapka Kirana shop pe ₹${Math.abs(selectedCustomer.balance)} udhari baki hai. Kripya jaldi bhugtan karein.`);
                    window.open(`https://wa.me/91${selectedCustomer.phone}?text=${msg}`, '_blank');
                  }}
                >
                  WHATSAPP
                </button>
              )}
            </div>

            {/* Accept Payment Form */}
            <div style={{ padding: '32px', borderBottom: '1px solid rgba(28,20,16,0.08)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px', textTransform: 'uppercase' }}>RECORD PAYMENT</h3>
              <div style={{ display: 'flex', border: '1px solid rgba(28,20,16,0.2)' }}>
                <input 
                  type="number" 
                  placeholder="AMOUNT (₹)" 
                  style={{ flex: 1, border: 'none', padding: '16px', fontFamily: 'var(--font-mono)', backgroundColor: 'transparent' }} 
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                />
                <button 
                  className="btn btn-primary"
                  style={{ borderRadius: 0, padding: '0 24px', letterSpacing: '2px' }}
                  onClick={recordPayment}
                  disabled={paymentLoading}
                >
                  SAVE
                </button>
              </div>
            </div>

            <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
              <h3 className="input-label" style={{ marginBottom: '16px' }}>HISTORY</h3>
              {transactions.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center', padding: '32px 0' }}>NO TRANSACTIONS RECORDED.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {transactions.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(28,20,16,0.04)' }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>{t.type === 'received' ? 'Received Payment' : 'Purchased Goods'}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                          {new Date(t.created_at).toLocaleDateString()} {t.bill_number ? `• ${t.bill_number}` : ''}
                        </p>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: t.type === 'received' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {t.type === 'received' ? '+' : '-'}₹{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
