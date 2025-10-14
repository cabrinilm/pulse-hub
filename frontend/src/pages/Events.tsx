import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import PaginationDots from '../components/PaginationDots';
import { useSwipeable } from 'react-swipeable';
import BackArrow from '../components/BackArrow';

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
  const location = useLocation();

  const previousPage = location.state?.from || '/';

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

  const goNext = useCallback(
    () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );
  const goPrev = useCallback(() => setCurrentPage((p) => Math.max(p - 1, 1)), []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => totalPages > 1 && goNext(),
    onSwipedRight: () => totalPages > 1 && goPrev(),
    trackTouch: true,
    trackMouse: true,
    delta: 50,
  });

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-24 relative text-white">
      {/* BackArrow — Mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Header — Desktop */}
      <div className="hidden md:flex items-center gap-4 mb-6">
        <BackArrow to={previousPage} animateOnClick />
        <h1 className="text-3xl font-bold">Events</h1>
      </div>

      {/* Header — Mobile */}
      <h1 className="md:hidden text-2xl font-bold mb-4 text-center">Events</h1>

      <div {...swipeHandlers} className="flex flex-col gap-4">
        {currentEvents.map((event) => (
          <Card
            key={event.id}
            title={event.title}
            date={event.event_date}
            location={event.location || ''}
            signup_count={event.signup_count || 0}
            onClick={() =>
              navigate(`/events/${event.id}`, { state: { from: location.pathname } })
            }
          />
        ))}
      </div>


      <div className="fixed bottom-4 left-0 w-full flex justify-center md:static md:mt-6">
        <PaginationDots
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <Navbar />
    </div>
  );
};

export default Events;

