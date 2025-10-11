import { useState, useEffect } from 'react';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

interface Profile {
  username: string;
  full_name: string | null;
}

const ProfileEdit = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [full_name, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<Profile>('/profile');
        setProfile(res.data);
        setUsername(res.data.username || '');
        setFullName(res.data.full_name || '');
      } catch (err) {
        toast.error('Error loading profile');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updates = { username, full_name };
      await api.patch('/profile', updates);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p className="p-4 text-center">Loading...</p>;

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <div className="flex flex-col gap-4">
        <label>Username</label>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />

        <label>Full Name</label>
        <Input value={full_name} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />

        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
      <Navbar />
    </div>
  );
};

export default ProfileEdit;