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
        const allEvents = await api.get<Event[]>('/events');
        // Assuma ordenado por date; filtre next event (mais próximo)
        const sortedEvents = allEvents.data.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        setNextEvent(sortedEvents[0] || null);
        setEvents(sortedEvents.slice(1, 4));  // Ex.: 3 events próximos
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      {nextEvent && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Next Event</h2>
          <Card title={nextEvent.title} description={nextEvent.description} date={nextEvent.event_date} location="" signup_count={0} />
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} title={event.title} description={event.description} date={event.event_date} location="" signup_count={0} />
          ))}
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Home;