import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Navbar from '../components/Navbar';
import BackArrow from '../components/BackArrow';
import Button from '../components/Button';
import Lottie from 'lottie-react';
import loadingAnimation from '../lottie/Trail_lottie.json';
import successAnimation from '../lottie/Successfully_lottie.json';
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
  const [successAnim, setSuccessAnim] = useState(false); 
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
      if (status === 'confirmed') {
        setSuccessAnim(true); 
      }
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Lottie animationData={loadingAnimation} loop={true} className="w-64 h-64" />
      </div>
    );

  if (!event) return <p className="p-4 text-center text-white">Event not found</p>;

  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'EEEE, dd MMM yyyy, HH:mm', { locale: enGB });

  return (
    <div className="p-3 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-24 relative">
      {/* BackArrow Mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Header */}
      <div className="hidden md:flex items-center gap-4 mb-6">
        <BackArrow to={previousPage} animateOnClick />
        <h1 className="text-3xl font-bold text-white">Event Details</h1>
      </div>
      <h1 className="md:hidden text-2xl font-bold mb-4 text-center text-white">Event Details</h1>

      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-md p-6 flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">{event.title}</h2>
          {event.description && <p className="text-white/80">{event.description}</p>}

          <div className="flex items-center gap-2 text-white/70">
            <Calendar size={16} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <MapPin size={16} />
            <span>{event.location || 'No location'}</span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>Signed up: {stats.signup_count}</span>
            </div>
            <span>Confirmed: {stats.confirmed_count}</span>
            <span>Rejected: {stats.rejected_count}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-white/20 backdrop-blur-md rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-white">Your Participation</h3>
          {!userSignup ? (
            <Button
              onClick={handleSignup}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Sign up for this event
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-white font-medium">
                Your status: <span className="capitalize">{userSignup.presence_status}</span>
              </p>
              {userSignup.presence_status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handlePresenceUpdate('confirmed')}
                    className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-200"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => handlePresenceUpdate('rejected')}
                    className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white transition-colors duration-200"
                  >
                    Reject
                  </Button>
                </div>
              )}
              <Button
                onClick={handleCancelSignup}
                className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-200"
              >
                Cancel Signup
              </Button>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
        </div>
      </div>

      {successAnim && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/40 z-20">
          <Lottie
            animationData={successAnimation}
            loop={false}
            className="w-64 h-64"
            onComplete={() => setSuccessAnim(false)}
          />
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default EventDetails;