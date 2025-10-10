import { useEffect, useState } from 'react';
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

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} title={event.title} description={event.description} date={event.event_date} location="" signup_count={0} />
        ))}
      </div>
      <Navbar />
    </div>
  );
};

export default Events;