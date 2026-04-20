import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    shop_name: user?.shop_name || '',
    owner_name: user?.owner_name || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await api.put('/auth/profile', formData);
      if (data.success) {
        setUser(data.data);
        setMessage(t('Profile updated successfully') || 'Profile updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('Server error') || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary-dark)', fontSize: '36px', lineHeight: 1.2, margin: 0 }}>
            {t('settings')}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: '8px' }}>
            PREFERENCES & ACCOUNT
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left Column: Profile */}
        <div className="stat-card" style={{ flex: 2 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '24px', textTransform: 'uppercase', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '16px' }}>{t('profileInfo')}</h2>
          
          {message && <div style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '24px' }}>{message}</div>}
          {error && <div style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '24px' }}>{error}</div>}

          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label className="input-label">{t('shopName')}</label>
              <input
                type="text"
                name="shop_name"
                className="input-field"
                value={formData.shop_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="input-label">{t('ownerName')}</label>
              <input
                type="text"
                name="owner_name"
                className="input-field"
                value={formData.owner_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="input-label">{t('phone')}</label>
              <input
                type="tel"
                name="phone"
                className="input-field"
                style={{ backgroundColor: 'rgba(28,20,16,0.02)', cursor: 'not-allowed' }}
                value={formData.phone}
                readOnly
                disabled
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)', marginTop: '8px', letterSpacing: '1px' }}>PHONE NUMBER CANNOT BE CHANGED CURRENTLY.</p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '16px 0', fontSize: '12px' }} disabled={loading}>
              {loading ? 'SAVING...' : t('saveChanges').toUpperCase()}
            </button>
          </form>
        </div>

        {/* Right Column: Preferences */}
        <div className="stat-card" style={{ flex: 1, backgroundColor: 'var(--color-surface)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '24px', textTransform: 'uppercase', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '16px' }}>{t('preferences')}</h2>
            
            {/* Language Selection */}
            <div style={{ marginBottom: '32px' }}>
              <label className="input-label" style={{ marginBottom: '12px' }}>{t('language')}</label>
              <div style={{ display: 'flex', border: '1px solid rgba(28,20,16,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                {languages.map((lang, index) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    style={{ 
                      flex: 1, padding: '12px', border: 'none', 
                      background: language === lang ? 'var(--color-primary-dark)' : 'transparent', 
                      color: language === lang ? 'var(--color-surface)' : 'var(--color-primary-dark)', 
                      fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                      borderRight: index < languages.length - 1 ? '1px solid rgba(28,20,16,0.2)' : 'none'
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="input-label" style={{ marginBottom: '12px' }}>{t('theme')}</label>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', padding: '16px 0', fontSize: '11px' }}
                onClick={toggleTheme}
              >
                {theme === 'light' ? 'SWITCH TO DARK MODE' : 'SWITCH TO LIGHT MODE'}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
