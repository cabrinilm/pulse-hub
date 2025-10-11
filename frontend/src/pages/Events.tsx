// src/pages/Events.tsx
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
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

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 3;
  const navigate = useNavigate();

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

  const totalPages = Math.max(1, Math.ceil(events.length / eventsPerPage));
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Handlers para alterar página com limites
  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  // Swipe handlers (mobile touch & desktop mouse drag)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (totalPages > 1) goNext();
    },
    onSwipedRight: () => {
      if (totalPages > 1) goPrev();
    },
    // configurações úteis:
    trackTouch: true,
    trackMouse: true, // permite testar com o mouse no desktop
    delta: 50, // distância mínima px para considerar swipe
    // preventDefaultTouchmoveEvent: true,
  });

  // Se a lista de events mudar e a página atual ficar fora do range, corrige:
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="relative p-4 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-16 md:mt-24">
      {/* Envolvemos a área que responde ao swipe */}
      <div {...swipeHandlers} className="flex flex-col gap-6">
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

      {/* Componente de bolinhas de paginação (reutilizável) */}
      <PaginationDots
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Navbar />
    </div>
  );
};

export default Events;
