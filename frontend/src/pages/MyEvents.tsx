// src/pages/MyEvents.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import PaginationDots from '../components/PaginationDots';
import { useSwipeable } from 'react-swipeable';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location?: string | null;
  signup_count?: number;
}

const MyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await api.get<Event[]>('/events?creator=true'); // endpoint para meus eventos
        setEvents(res.data || []);
      } catch (err) {
        console.error('Error fetching my events:', err);
      }
    };
    fetchMyEvents();
  }, []);

  const totalPages = Math.max(1, Math.ceil(events.length / eventsPerPage));
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Swipe handlers
  const goNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 1));

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => totalPages > 1 && goNext(),
    onSwipedRight: () => totalPages > 1 && goPrev(),
    trackTouch: true,
    trackMouse: true,
    delta: 50,
  });

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-24">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">My Events</h1>

      <div {...swipeHandlers} className="flex flex-col gap-4">
        {currentEvents.map((event) => (
          <Card
            key={event.id}
            title={event.title}
            date={event.event_date}
            location={event.location || ''}
            signup_count={event.signup_count || 0}
            editMode={true} // mostra botão de edição
            onEdit={() => navigate(`/events/edit/${event.id}`)} // vai para EditEvent
          />
        ))}
      </div>

      {/* Paginação por bolinhas */}
      {totalPages > 1 && (
        <div className="fixed bottom-4 left-0 w-full flex justify-center md:static md:mt-6">
          <PaginationDots
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default MyEvents;
