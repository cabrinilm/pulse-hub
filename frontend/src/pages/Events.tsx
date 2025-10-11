// src/pages/Events.tsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location?: string | null;
  signup_count?: number;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 3; // limite de 3 eventos por página
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get<Event[]>('/events');
        setEvents(res.data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    fetchEvents();
  }, []);

  const totalPages = Math.ceil(events.length / eventsPerPage);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 md:ml-[18rem] mt-16 md:mt-24">
      <div className="flex flex-col gap-6">
        {currentEvents.map((event) => (
          <Card
            key={event.id}
            title={event.title}
            date={event.event_date}
            location={event.location || ''}
            signup_count={event.signup_count || 0}
            onClick={() => navigate(`/events/${event.id}`)}
          />
        ))}
      </div>

      {/* Menu de bolinhas para navegação entre páginas */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6 md:mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentPage === i + 1 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            />
          ))}
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default Events;
