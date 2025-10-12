// src/pages/MyEvents.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { Plus } from 'lucide-react';
import Button from '../components/Button';
import BackArrow from '../components/BackArrow';

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
  const navigate = useNavigate();
  const location = useLocation();

  const previousPage = location.state?.from || '/';

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      try {
        const res = await api.get<Event[]>('/events');
        // filtra apenas os eventos criados pelo user logado
        const myEvents = res.data.filter(event => event.creator_id === user.id);
        setEvents(myEvents);
      } catch (err) {
        console.error('Error fetching my events:', err);
      }
    };
    fetchMyEvents();
  }, [user]);

  return (
    <div className="p-4 md:p-8 md:ml-[18rem] mt-16 md:mt-24 relative">
      {/* BackArrow visível apenas em mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">My Events</h1>

      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            title={event.title}
            date={event.event_date}
            location={event.location || ''}
            signup_count={event.signup_count || 0}
            onClick={() => navigate(`/events/edit/${event.id}`, { state: { from: location.pathname } })}
            buttonText="Edit Event"
          />
        ))}
      </div>

      {/* Botão de criar novo evento */}
      <div className="mt-6 flex justify-center md:justify-start">
        <Button
          onClick={() => navigate('/events/create', { state: { from: location.pathname } })}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4"
          aria-label="Create Event"
        >
          <Plus size={20} />
        </Button>
      </div>

      <Navbar />
    </div>
  );
};

export default MyEvents;
