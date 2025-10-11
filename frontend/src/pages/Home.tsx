// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  // Outros campos
}

const Home = () => {
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/events');
        console.log('Raw response:', res);

        const eventData = res.data?.data || res.data || [];
        if (!Array.isArray(eventData)) {
          console.error('Fetched data is not an array:', eventData);
          return;
        }

        const sortedEvents = eventData.sort(
          (a: Event, b: Event) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );
        setNextEvent(sortedEvents[0] || null);
        setEvents(sortedEvents.slice(1, 3)); // apenas 2 eventos depois do nextEvent
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 md:ml-[18rem]">
      {/* Aumentei mt-8 para mt-24 para mais espaço abaixo do header */}
      <div className="mt-16 md:mt-24">
        {nextEvent && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Next Event</h2>
            <Card
              title={nextEvent.title}
              date={nextEvent.event_date}
              location=""
              signup_count={0}
            />
          </div>
        )}

        {events.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <Card
                  key={event.id}
                  title={event.title}
                  date={event.event_date}
                  location=""
                  signup_count={0}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default Home;

