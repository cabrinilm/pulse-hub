import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { Plus } from 'lucide-react';
import Button from '../components/Button';
import BackArrow from '../components/BackArrow';
import Lottie from 'lottie-react';
import loadingAnimation from '../lottie/Trail_lottie.json';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location?: string | null;
  signup_count?: number;
  creator_id: string;
}

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const previousPage = location.state?.from || '/';

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get<Event[]>('/events');
        const myEvents = res.data.filter(event => event.creator_id === user.id);
        setEvents(myEvents);
      } catch (err) {
        console.error('Error fetching my events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Lottie animationData={loadingAnimation} loop className="w-64 h-64" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 md:ml-[18rem] mt-14 md:mt-24 relative">
      {/* BackArrow Mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Header — Desktop */}
      <div className="hidden md:flex items-center gap-4 mb-6">
        <BackArrow to={previousPage} animateOnClick />
        <h1 className="text-3xl font-bold text-white">My Events</h1>
      </div>

      {/* Header — Mobile */}
      <h1 className="md:hidden text-2xl font-bold mb-4 text-center text-white">My Events</h1>

      <div className="flex flex-col gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <Card
              key={event.id}
              title={event.title}
              date={event.event_date}
              location={event.location || ''}
              signup_count={event.signup_count || 0}
              onClick={() => navigate(`/events/edit/${event.id}`, { state: { from: location.pathname } })}
              buttonText="Edit Event"
            />
          ))
        ) : (
          <p className="text-white/80 text-center">You have not created any events yet.</p>
        )}
      </div>

     
      <div className="mt-6 flex justify-center md:justify-start">
        <Button
          onClick={() => navigate('/events/create', { state: { from: location.pathname } })}
          className="
            flex items-center gap-2 px-5 py-3 rounded-full
            bg-teal-500 hover:bg-teal-600 text-white
            shadow-md hover:shadow-lg transition-all duration-200
          "
          aria-label="Create Event"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Create Event</span>
        </Button>
      </div>

      <Navbar />
    </div>
  );
};

export default MyEvents;