import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    // Client-side validation
    if (!phone || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone must be a 10-digit number');
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Khansa Logo" 
            className="w-24 h-24 mx-auto mb-6 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="text-3xl font-serif text-neutral-900 tracking-widest uppercase">Khansa</h1>
          <p className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 mt-2">Enterprise POS & Ledger</p>
        </div>

        {/* Form Card */}
        <div className="card p-8 border border-neutral-300 rounded-none shadow-2xl bg-white">
          <h2 className="text-xl font-serif text-neutral-900 mb-6 uppercase tracking-widest border-b border-neutral-300 pb-4">Auth Sign In</h2>

          {error && (
            <div className="bg-danger-600 text-white font-mono text-[10px] uppercase tracking-widest px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="input-field font-mono"
                placeholder="ENTER 10-DIGIT NUMBER"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                id="login-phone"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-2">
                Password
              </label>
              <input
                type="password"
                className="input-field font-mono"
                placeholder="ENTER PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="login-password"
              />
            </div>

            <button
              className="btn btn-primary w-full text-xs"
              onClick={handleLogin}
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <span className="spinner border-white" style={{ width: '1rem', height: '1rem' }}></span>
                  <span>AUTHENTICATING...</span>
                </div>
              ) : (
                'SIGN IN'
              )}
            </button>
          </div>

          <div className="mt-8 text-center border-t border-neutral-300 pt-6">
            <p className="text-sm font-mono text-neutral-500 mb-2">No account?</p>
            <Link to="/register" className="text-primary-600 font-mono text-[10px] uppercase tracking-widest font-bold hover:underline">
              REQUEST ACCESS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
