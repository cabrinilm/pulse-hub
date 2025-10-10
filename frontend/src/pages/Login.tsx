import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');  // Para signup
  const [isSignup, setIsSignup] = useState(false);  // Toggle login/signup
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
      navigate('/');  // Redireciona para home após sucesso
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{isSignup ? 'Cadastro' : 'Login'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Senha"
          className="p-2 border rounded-md w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md w-full">
          {isSignup ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>
      <button onClick={() => setIsSignup(!isSignup)} className="mt-2 text-blue-500">
        {isSignup ? 'Já tem conta? Login' : 'Criar nova conta'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default Login;