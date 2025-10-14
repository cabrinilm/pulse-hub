// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginHeader from '../components/LoginHeader';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const errorMessages: { [key: string]: string } = {
    'missing email or phone': 'Missing email or password',
    'Invalid login credentials': 'Invalid email or password',
    'User already registered': 'User already registered',
    'Email not confirmed': 'Please confirm your email before logging in',
    'Too many requests': 'Too many attempts – try again in a few minutes',
    default: 'Authentication error. Please try again.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err: any) {
      const customError = errorMessages[err.message] || errorMessages.default;
      setError(customError);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E0F2FE] flex flex-col">
      {/* Header próprio para login/signup */}
      <LoginHeader />

      {/* Box central */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 md:px-8 mt-12">
        <motion.div
          className="w-full max-w-md bg-white dark:bg-neutral-dark rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-neutral-dark"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        >
          <motion.h1 className="text-3xl font-bold mb-6 text-[#1E293B] dark:text-neutral-light">
            {isSignup ? 'Sign Up' : 'Login'}
          </motion.h1>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignup ? 'signup' : 'login'}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {isSignup && (
                <motion.input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="p-3 border border-slate-300 dark:border-neutral-light rounded-md w-full focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors placeholder-slate-400 dark:placeholder-neutral-light"
                />
              )}

              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="p-3 border border-slate-300 dark:border-neutral-light rounded-md w-full focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors placeholder-slate-400 dark:placeholder-neutral-light"
              />

              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="p-3 border border-slate-300 dark:border-neutral-light rounded-md w-full focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors placeholder-slate-400 dark:placeholder-neutral-light"
              />

              {error && (
                <p className="text-[#EF4444] text-sm mt-1 font-medium">{error}</p>
              )}

              <Button type="submit" variant="primary">
                {isSignup ? 'Sign Up' : 'Login'}
              </Button>
            </motion.form>
          </AnimatePresence>

          <motion.button
            onClick={() => setIsSignup(!isSignup)}
            className="mt-4 text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSignup ? 'Already have an account? Login' : 'Create a new account'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
