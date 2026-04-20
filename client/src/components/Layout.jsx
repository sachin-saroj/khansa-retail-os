import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const KiranaLogo = () => (
  <div style={{ backgroundColor: 'var(--color-gold)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary-dark)', fontSize: '24px', lineHeight: 1 }}>K</span>
  </div>
);

const navItems = [
  { path: '/dashboard', label: 'DASHBOARD' },
  { path: '/products', label: 'PRODUCTS' },
  { path: '/billing', label: 'NEW BILL' },
  { path: '/customers', label: 'UDHARI BOOK' },
  { path: '/reports', label: 'REPORTS' },
  { path: '/settings', label: 'SETTINGS' },
];

const Layout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar: 200px fixed, background #1C1410 */}
      <aside style={{ width: '200px', flexShrink: 0, backgroundColor: 'var(--color-primary-dark)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Brand Header */}
        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <KiranaLogo />
          <h1 style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '2px', margin: 0 }}>KIRANA OS</h1>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '12px 24px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--color-gold)' : 'var(--color-muted)',
                  borderLeft: isActive ? '3px solid var(--color-gold)' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(201, 162, 39, 0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '24px' }}>
          <button
            onClick={logout}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '1.5px',
              color: 'var(--color-muted)',
              border: 'none',
              background: 'transparent',
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left'
            }}
          >
            LOGOUT SESSION
          </button>
        </div>
      </aside>

      {/* Main Content: flex-1, padding 28px 32px, bg #F5F0E8 */}
      <main style={{ flex: 1, padding: '28px 32px', backgroundColor: 'var(--color-bg)', overflowY: 'auto' }} className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
