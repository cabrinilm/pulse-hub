import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get('token'); 
  const type = searchParams.get('type');

  useEffect(() => {
   
    if (!token || type !== 'recovery') {
      setError('Invalid reset link. Please request a new one.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [token, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

  
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <div className="flex flex-1 items-center justify-center px-4 sm:px-0">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-4"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2
                className="text-3xl font-bold text-white text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
              >
                Set New Password
              </motion.h2>

              {error && (
                <motion.p
                  className="text-red-400 text-sm text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.1 } }}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-3 rounded-xl w-full font-medium transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Set New Password'}
                </Button>
              </motion.form>
            </motion.div>
          ) : (
            <motion.div
              className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-4 items-center justify-center text-center"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <p className="text-green-500 text-lg">
                Password updated! Redirecting to login...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResetPassword;
