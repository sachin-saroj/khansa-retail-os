import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setError('');
    const { shop_name, owner_name, phone, password, confirmPassword } = formData;

    // Client-side validation
    if (!shop_name || !owner_name || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone must be a 10-digit number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({ shop_name, owner_name, phone, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4 font-sans py-12">
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
          <h2 className="text-xl font-serif text-neutral-900 mb-6 uppercase tracking-widest border-b border-neutral-300 pb-4">Request Access</h2>

          {error && (
            <div className="bg-danger-600 text-white font-mono text-[10px] uppercase tracking-widest px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-2">
                Business Entity Name
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="ENTER REGISTERED NAME"
                value={formData.shop_name}
                onChange={(e) => handleChange('shop_name', e.target.value)}
                id="register-shop-name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-2">
                Proprietor / Representative
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="ENTER FULL NAME"
                value={formData.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                id="register-owner-name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                className="input-field font-mono"
                placeholder="ENTER 10-DIGIT NUMBER"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                maxLength={10}
                id="register-phone"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-2">
                Secure Password
              </label>
              <input
                type="password"
                className="input-field font-mono"
                placeholder="MINIMUM 6 CHARACTERS"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                id="register-password"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-2">
                Verify Password
              </label>
              <input
                type="password"
                className="input-field font-mono"
                placeholder="RE-ENTER PASSWORD"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                id="register-confirm-password"
              />
            </div>

            <button
              className="btn btn-primary w-full text-xs mt-4"
              onClick={handleRegister}
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <span className="spinner border-white" style={{ width: '1rem', height: '1rem' }}></span>
                  <span>REGISTERING...</span>
                </div>
              ) : (
                'SUBMIT APPLICATION'
              )}
            </button>
          </div>

          <div className="mt-8 text-center border-t border-neutral-300 pt-6">
            <p className="text-sm font-mono text-neutral-500 mb-2">Already have authorization?</p>
            <Link to="/login" className="text-primary-600 font-mono text-[10px] uppercase tracking-widest font-bold hover:underline">
              AUTHENTICATE HERE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
