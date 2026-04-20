import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    rangeSales: 0,
    rangeProfit: 0,
    billsCount: 0,
    lowStockItems: 0,
    totalMarketUdhari: 0,
    salesChart: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/dashboard/stats', { params: { range: 'weekly' } });
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary-dark)', fontSize: '36px', lineHeight: 1.2, margin: 0 }}>
          Welcome, {user?.owner_name}
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: '8px' }}>
          {user?.shop_name} — BUSINESS OVERVIEW
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="spinner" style={{ color: 'var(--color-gold)' }}></span>
        </div>
      ) : (
        <>
          {/* Stat Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="stat-card" style={{ borderTop: '3px solid var(--color-success)' }}>
              <p className="input-label">7-DAY SALES</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--color-primary-dark)', margin: '8px 0' }}>₹{stats.rangeSales}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)' }}>{stats.billsCount} Bills Generated</p>
            </div>
            
            <div className="stat-card" style={{ borderTop: '3px solid var(--color-gold)' }}>
              <p className="input-label">7-DAY PROFIT</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--color-primary-dark)', margin: '8px 0' }}>₹{stats.rangeProfit}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)' }}>Estimated margin</p>
            </div>
        
            <div className="stat-card" style={{ borderTop: '3px solid var(--color-danger)' }}>
              <p className="input-label">MARKET UDHARI</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--color-danger)', margin: '8px 0' }}>₹{stats.totalMarketUdhari}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)' }}>Total outstanding amount</p>
            </div>

            <Link to="/products" className="stat-card" style={{ borderTop: '3px solid var(--color-warning)', textDecoration: 'none', display: 'block' }}>
              <p className="input-label">LOW STOCK</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--color-warning)', margin: '8px 0' }}>{stats.lowStockItems}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)' }}>Requires attention</p>
            </Link>
          </div>

          {/* Chart & Top Products Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            
            {/* Sales Chart Panel */}
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px', color: 'var(--color-primary-dark)' }}>
                7-DAY SALES TREND
              </h3>
              <div style={{ flex: 1, minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salesChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: 'var(--color-muted)', fontFamily: 'var(--font-mono)'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 11, fill: 'var(--color-muted)', fontFamily: 'var(--font-mono)'}} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip 
                      cursor={{fill: 'rgba(28,20,16,0.03)'}}
                      contentStyle={{ borderRadius: '6px', border: '1px solid rgba(28,20,16,0.08)', backgroundColor: 'var(--color-surface)' }}
                      labelStyle={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary-dark)', fontSize: '11px' }}
                      itemStyle={{ fontFamily: 'var(--font-sans)', color: 'var(--color-primary-dark)', fontSize: '14px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                      {
                        stats.salesChart.map((entry, index) => {
                          const isToday = index === stats.salesChart.length - 1;
                          return <Cell key={`cell-${index}`} fill="var(--color-gold)" stroke={isToday ? "var(--color-primary-dark)" : "none"} strokeWidth={isToday ? 2 : 0} strokeDasharray={isToday ? "4 4" : "none"} />;
                        })
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Side Stack: Quick Stats Dark Card + Top Products */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ backgroundColor: 'var(--color-primary-dark)', color: 'var(--color-surface)', padding: '24px', borderRadius: '10px' }}>
                 <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-gold)', marginBottom: '8px' }}>QUICK STATS</p>
                 <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', lineHeight: 1.4 }}>
                    Generating {stats.rangeSales > 0 ? 'an active' : 'a quiet'} sales rhythm this week with {stats.billsCount} transactions.
                 </p>
              </div>

              <div className="stat-card" style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
                  TOP PRODUCTS
                </h3>
                {stats.topProducts && stats.topProducts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {stats.topProducts.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '12px' }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{p.name}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>{p.total_sold} units</p>
                        </div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-gold)' }}>₹{p.total_revenue}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)' }}>No data.</p>
                )}
              </div>
            </div>

          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', borderTop: '1px solid rgba(28,20,16,0.08)', paddingTop: '24px' }}>
            <Link to="/billing" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              CREATE NEW BILL
            </Link>
            <Link to="/customers" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              MANAGE UDHARI
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
