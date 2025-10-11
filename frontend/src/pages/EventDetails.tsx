import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  is_public: boolean;
  creator_id: string;
}

interface Stats {
  signup_count: number;
  confirmed_count: number;
  rejected_count: number;
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<Stats>({ signup_count: 0, confirmed_count: 0, rejected_count: 0 });
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await api.get<Event>(`/events/${id}`);
        setEvent(eventRes.data);
        setIsCreator(eventRes.data.creator_id === user?.id);

        const statsRes = await api.get<Stats>(`/events/${id}/signups`);
        setStats(statsRes.data);
      } catch (err: any) {
        setError(err.message || 'Error loading event data');
      }
    };
    fetchData();
  }, [id, user]);

  const handleAddUser = async () => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/events/${id}/add-user`, { username });
      setSuccess('User added successfully!');
      // Refetch stats
      const updatedStats = await api.get<Stats>(`/events/${id}/signups`);
      setStats(updatedStats.data);
    } catch (err: any) {
      setError(err.message || 'Error adding user');
    }
  };

  if (!event) return <p className="p-4 text-center">Loading...</p>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
      <p className="text-gray-600">Description: {event.description || 'No description'}</p>
      <p className="text-gray-600">Date: {event.event_date}</p>
      <p className="text-gray-600">Location: {event.location || 'No location'}</p>
      <p className="text-gray-600">Signed up: {stats.signup_count}</p>
      <p className="text-gray-600">Confirmed: {stats.confirmed_count}</p>
      <p className="text-gray-600">Rejected: {stats.rejected_count}</p>

      {isCreator && !event.is_public && (
        <div className="flex flex-col gap-2 md:w-1/2">
          <h3 className="text-lg font-semibold">Add User (Private Event)</h3>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User's username" />
          <Button onClick={handleAddUser}>Add</Button>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default EventDetails;