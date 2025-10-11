// src/pages/EventDetails.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';

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

interface Signup {
  user_id: string;
  event_id: string;
  presence_status: 'pending' | 'confirmed' | 'rejected';
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<Stats>({ signup_count: 0, confirmed_count: 0, rejected_count: 0 });
  const [userSignup, setUserSignup] = useState<Signup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch event, stats and user signup
  const fetchEventAndSignup = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const eventRes = await api.get<Event>(`/events/${id}`);
      setEvent(eventRes.data);

      const statsRes = await api.get<Stats>(`/events/${id}/signups`);
      setStats(statsRes.data);

      const userSignupsRes = await api.get<Signup[]>('/signups');
      const foundSignup = userSignupsRes.data.find(
        (s: Signup) => s.event_id === id && s.user_id === user.id
      );
      setUserSignup(foundSignup || null);
    } catch (err: any) {
      setError(err.message || 'Error loading event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndSignup();
  }, [id, user]);

  const handleSignup = async () => {
    if (!user) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/events/${id}/signups`);
      setSuccess('You have successfully signed up!');
      fetchEventAndSignup();
    } catch (err: any) {
      setError(err.message || 'Error signing up');
    }
  };

  const handlePresenceUpdate = async (status: 'confirmed' | 'rejected') => {
    if (!user) return;
    setError('');
    setSuccess('');
    try {
      await api.patch(`/events/${id}/signups`, { presence_status: status });
      setSuccess(`Your presence has been ${status}!`);
      fetchEventAndSignup();
    } catch (err: any) {
      setError(err.message || 'Error updating presence status');
    }
  };

  const handleCancelSignup = async () => {
    if (!user) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/events/${id}/signups`);
      setSuccess('Your signup has been cancelled.');
      setUserSignup(null);
      fetchEventAndSignup();
    } catch (err: any) {
      setError(err.message || 'Error cancelling signup');
    }
  };

  if (loading || !event) return <p className="p-4 text-center">Loading...</p>;

  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'EEEE, dd MMM yyyy, HH:mm', { locale: enGB });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
      {event.description && <p className="text-gray-700">{event.description}</p>}
      <p className="text-gray-600">Date: {formattedDate}</p>
      <p className="text-gray-600">Location: {event.location || 'No location'}</p>

      <div className="flex gap-4 text-gray-600">
        <p>Signed up: {stats.signup_count}</p>
        <p>Confirmed: {stats.confirmed_count}</p>
        <p>Rejected: {stats.rejected_count}</p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {!userSignup ? (
          <Button onClick={handleSignup}>Sign up for this event</Button>
        ) : (
          <>
            <p className="text-gray-700">Your status: {userSignup.presence_status}</p>

            {userSignup.presence_status === 'pending' && (
              <div className="flex gap-2">
                <Button variant="primary" onClick={() => handlePresenceUpdate('confirmed')}>Confirm</Button>
                <Button variant="secondary" onClick={() => handlePresenceUpdate('rejected')}>Reject</Button>
              </div>
            )}

            <Button variant="secondary" onClick={handleCancelSignup}>Cancel Signup</Button>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      <Navbar />
    </div>
  );
};

export default EventDetails;
