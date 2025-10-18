import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import BackArrow from '../components/BackArrow';
import LoadingOverlay from '../components/LoadingOverlay';

interface Profile {
  username: string;
  full_name: string | null;
}

const ProfileEdit = () => {
  useAuth();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [full_name, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const previousPage = location.state?.from || '/';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<Profile>('/profile');
        setUsername(res.data.username || '');
        setFullName(res.data.full_name || '');
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Error loading profile' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updates = { username, full_name };
      await api.patch('/profile', updates);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.toLowerCase() || '';
      const isDuplicate = errorMsg.includes('username already exists');
      setMessage({
        type: 'error',
        text: isDuplicate ? 'This username is already taken. Please choose another.' : 'Error updating profile',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="flex flex-col p-3 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-6 relative min-h-screen">
      {/* BackArrow Mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Header */}
      <div className="hidden md:flex items-center gap-4 mb-6">
        <BackArrow to={previousPage} animateOnClick />
        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
      </div>
      <h1 className="md:hidden text-2xl font-bold mb-4 text-center text-white">Edit Profile</h1>

      <div className="flex flex-1 items-center justify-center px-4 sm:px-0">
        <div className="relative z-10 w-full max-w-lg bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-4">
          <motion.h2
            className="text-3xl font-bold text-white text-center mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
          >
            Edit Profile
          </motion.h2>

          {message && (
            <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}

          <div className="flex flex-col gap-4 w-full">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            />

            <input
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            />

            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-3 rounded-xl w-full font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default ProfileEdit;
