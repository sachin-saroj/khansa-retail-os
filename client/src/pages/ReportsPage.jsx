import { useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const ReportsPage = () => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownloadCSV = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/export-csv', {
        params: { startDate, endDate },
        responseType: 'blob' // Important for file downloads
      });

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileDateSuffix = (startDate && endDate) ? `${startDate}_${endDate}` : 'all_time';
      link.setAttribute('download', `kirana_report_${fileDateSuffix}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(28,20,16,0.08)', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary-dark)', fontSize: '36px', lineHeight: 1.2, margin: 0 }}>
            {t('reports')} & EXPORT
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: '8px' }}>
            STATISTICS & DATA DOWNLOAD
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px', textTransform: 'uppercase' }}>SALES REPORT</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-muted)', marginBottom: '32px' }}>Download your daily/monthly sales data in Excel (CSV) format for accounting or GST filing.</p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">START DATE</label>
              <input 
                type="date" 
                className="input-field" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">END DATE</label>
              <input 
                type="date" 
                className="input-field" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px 0', fontSize: '12px' }}
            onClick={handleDownloadCSV}
            disabled={loading}
          >
            {loading ? 'DOWNLOADING...' : 'DOWNLOAD EXCEL (CSV)'}
          </button>
        </div>

        <div className="stat-card" style={{ flex: 1, backgroundColor: 'rgba(28,20,16,0.02)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px', textTransform: 'uppercase' }}>GSTR-1 READY FORMAT</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-muted)', marginBottom: '32px' }}>Automated GST return filing format matching exactly what the Indian government portal expects.</p>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(28,20,16,0.2)', padding: '64px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '2px', color: 'var(--color-muted)' }}>COMING SOON</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
