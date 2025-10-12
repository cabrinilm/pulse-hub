// src/pages/EventDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import BackArrow from '../components/BackArrow';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { Calendar, MapPin, Users } from 'lucide-react';

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
  const location = useLocation();
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<Stats>({ signup_count: 0, confirmed_count: 0, rejected_count: 0 });
  const [userSignup, setUserSignup] = useState<Signup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const previousPage = location.state?.from || '/';

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
    <div className="p-4 md:p-8 max-w-4xl mx-auto mt-14 md:mt-24 md:ml-[18rem] relative">
      {/* BackArrow visível apenas em mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Título seguindo o mesmo padrão do Events.tsx */}
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Event Details</h1>

      {/* Card do evento */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">{event.title}</h2>
        {event.description && <p className="text-gray-500">{event.description}</p>}

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} />
          <span>{event.location || 'No location'}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>Signed up: {stats.signup_count}</span>
          </div>
          <span>Confirmed: {stats.confirmed_count}</span>
          <span>Rejected: {stats.rejected_count}</span>
        </div>
      </div>

      {/* Ações do usuário */}
      <div className="flex flex-col gap-4 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold">Your Participation</h3>
        {!userSignup ? (
          <Button onClick={handleSignup} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
            Sign up for this event
          </Button>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-gray-700 font-medium">
              Your status: <span className="capitalize">{userSignup.presence_status}</span>
            </p>
            {userSignup.presence_status === 'pending' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => handlePresenceUpdate('confirmed')}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => handlePresenceUpdate('rejected')}
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
                >
                  Reject
                </Button>
              </div>
            )}
            <Button
              onClick={handleCancelSignup}
              variant="secondary"
              className="w-full sm:w-auto bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel Signup
            </Button>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
      </div>

      <Navbar />
    </div>
  );
};

export default EventDetails;
