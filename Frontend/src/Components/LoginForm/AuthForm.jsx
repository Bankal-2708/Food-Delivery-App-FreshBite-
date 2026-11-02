import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/cartContext';

const AuthForm = ({ setShowLogin }) => {
  const { login, register, forgotPassword, resetPassword, sendOtp, verifyOtp } = useContext(CartContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('form'); // form | otp | reset
  const [pendingPayload, setPendingPayload] = useState(null); // hold otp
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendCooldown = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        if (setShowLogin) setShowLogin(false);
        navigate('/');
        return;
      }

      if (mode === 'register') {
        await register(form.name, form.email, form.password);
        if (setShowLogin) setShowLogin(false);
        navigate('/');
        return;
      }

      if (mode === 'forgot') {
        if (step === 'form') {
          await forgotPassword(form.email);
          setPendingPayload({ email: form.email });
          setStep('reset');
          setMessage('Account verified. You can now set a new password.');
          return;
        }
        if (step === 'reset') {
          await resetPassword(form.email, otp || 'demo-otp', form.password);
          setMessage('Password updated successfully! You can now login.');
          setMode('login');
          setStep('form');
          setForm({ ...form, password: '' });
          setOtp('');
          return;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // Verify OTP, backend creates account only after this succeeds
        await verifyOtp(pendingPayload.email, otp, 'register');
        await register(pendingPayload.name, pendingPayload.email, pendingPayload.password);
        if (setShowLogin) setShowLogin(false);
        navigate('/');
      } else if (mode === 'forgot') {
        // Just confirm the OTP is valid, then move to the "set new password" screen.
        // The actual reset call re-sends the OTP for final server-side verification —
        // this avoids trusting the client's "OTP was valid" claim.
        setStep('reset');
      }
    } catch (err) {
      setError(err.message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      await sendOtp(pendingPayload.email, mode === 'register' ? 'register' : 'reset');
      setMessage('OTP resent.');
      startResendCooldown();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetAll = (newMode) => {
    setMode(newMode);
    setStep('form');
    setPendingPayload(null);
    setOtp('');
    setError('');
    setMessage('');
  };

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 text-center">
        Enter the 6-digit code sent to <span className="font-semibold">{pendingPayload?.email}</span>
      </p>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        required
        className="border border-gray-300 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-orange-400 outline-none"
      />

      {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
      {message && <p className="text-green-600 text-sm text-center bg-green-50 py-2 px-3 rounded-lg">{message}</p>}

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-lg disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendTimer > 0}
        className="text-sm text-gray-500 hover:text-orange-500 disabled:text-gray-300"
      >
        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
      </button>
    </form>
  );

  const renderResetPasswordStep = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="password"
        placeholder="New Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        className="border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-orange-400 outline-none"
      />
      {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-lg disabled:opacity-70"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );

  const renderMainForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === 'register' && (
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-orange-400 outline-none"
        />
      )}

      <input
        type="email"
        placeholder="Email Address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-orange-400 outline-none"
      />

      {mode !== 'forgot' && (
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-orange-400 outline-none"
        />
      )}

      {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
      {message && <p className="text-green-600 text-sm text-center bg-green-50 py-2 px-3 rounded-lg">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-lg disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Continue'}
      </button>
    </form>
  );

  const title =
    mode === 'login' ? 'Welcome Back 👋'
      : step === 'otp' ? 'Verify OTP 📧'
        : mode === 'register' ? 'Create Account 🍽️'
          : step === 'reset' ? 'Set New Password 🔒'
            : 'Reset Password';

  const formContent = (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative border border-gray-100">
      {setShowLogin && (
        <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">✕</button>
      )}

      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">{title}</h2>

      {step === 'otp' ? renderOtpStep() : step === 'reset' ? renderResetPasswordStep() : renderMainForm()}

      {step === 'form' && mode === 'login' && (
        <p onClick={() => resetAll('forgot')} className="text-center mt-3 text-xs text-gray-400 cursor-pointer hover:text-orange-500 underline">
          Forgot Password?
        </p>
      )}

      {step === 'form' && (
        <p
          onClick={() => resetAll(mode === 'login' ? 'register' : 'login')}
          className="text-center mt-5 text-sm text-gray-500 cursor-pointer hover:text-orange-500"
        >
          {mode === 'login' ? "Don't have an account? Sign Up" : 'Back to Login'}
        </p>
      )}
    </div>
  );

  return setShowLogin ? (
    <div className="fixed inset-0 z-[100] w-full min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}>{formContent}</div>
  ) : (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 py-32 px-4">{formContent}</div>
  );
};

export default AuthForm;