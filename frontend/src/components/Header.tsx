import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // redirecionamento feito no componente que chama signOut, se necessário
    } catch (err) {
      console.error('Erro ao encerrar sessão:', err);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center z-10">
      {/* Ícone de perfil */}
      {user ? (
        <Link to="/profile/edit" className="text-gray-600 hover:text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor" fill="none" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 12a4 4 0 100-8 4 4 0 000 8zm-6.879 5.804A8.966 8.966 0 0112 15a8.966 8.966 0 016.879 2.804"
            />
          </svg>
        </Link>
      ) : (
        <div className="w-6" /> // mantém alinhamento quando não há user
      )}

      {/* Nome do app */}
      <h1 className="text-xl font-bold">PulseHub</h1>

      {/* Botão de logout */}
      {user ? (
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-500 cursor-pointer"
          aria-label="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>
        </button>
      ) : (
        <div className="w-6" />
      )}
    </header>
  );
};

export default Header;
