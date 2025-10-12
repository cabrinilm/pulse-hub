// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Para signup
  const [isSignup, setIsSignup] = useState(false); // Toggle login/signup
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      navigate('/'); // Redireciona para home após login/signup
    } catch (err: any) {
      setError(err.message || 'Error during authentication');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-col items-center justify-center flex-1 p-4 md:p-8 mt-24">
        <h1 className="text-2xl font-bold mb-6 w-full max-w-md text-left">
          {isSignup ? 'Sign Up' : 'Login'}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-md"
        >
          {isSignup && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="p-2 border rounded-md w-full"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border rounded-md w-full"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-2 border rounded-md w-full"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </Button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 text-blue-600 hover:underline"
        >
          {isSignup ? 'Already have an account? Login' : 'Create a new account'}
        </button>
      </div>
    </div>
  );
};

export default Login;

