// src/pages/Events.tsx
import { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 3;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get<Event[]>('/events');
        setEvents(res.data);
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

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
    onSwipedRight: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
    trackMouse: true,
  });

  // altura mínima para manter o menu de bolinhas fixo
  const minHeightPerCard = 200; // ajuste conforme a altura do seu Card
  const containerMinHeight = eventsPerPage * minHeightPerCard;

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 md:ml-[18rem] mt-24">
      <div
        {...swipeHandlers}
        className="flex flex-col gap-6"
        style={{ minHeight: containerMinHeight }}
      >
        {currentEvents.map((event) => (
          <Card
            key={event.id}
            title={event.title}
            description={event.description}
            date={event.event_date}
            location=""
            signup_count={0}
          />
        ))}
      </div>

      {/* Menu de bolinhas */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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
