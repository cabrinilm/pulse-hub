import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  signup_count?: number; 
}

const Home = () => {
  const navigate = useNavigate();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<Event[]>('/events');
        const eventData = res.data;

        const eventsWithSignups = await Promise.all(
          eventData.map(async (event) => {
            try {
              const statsRes = await api.get(`/events/${event.id}/signups`);
              return { ...event, signup_count: statsRes.data.signup_count };
            } catch {
              return { ...event, signup_count: 0 };
            }
          })
        );

        const sortedEvents = eventsWithSignups.sort(
          (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );

        setNextEvent(sortedEvents[0] || null);
        setEvents(sortedEvents.slice(1, 3));
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8 md:ml-[18rem] mt-14 md:mt-6">
      <div className="flex flex-col gap-6">
        {nextEvent && (
          <div>
            <h2 className="text-3xl md:text-3xl font-bold mb-2 text-white">Next Event</h2>
            <Card
              title={nextEvent.title}
              date={nextEvent.event_date}
              location={nextEvent.location}
              signup_count={nextEvent.signup_count || 0}
              onClick={() => navigate(`/events/${nextEvent.id}`)}
            />
          </div>
        )}

        {events.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-2xl font-bold mb-2 text-white">Upcoming Events</h2>
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <Card
                  key={event.id}
                  title={event.title}
                  date={event.event_date}
                  location={event.location}
                  signup_count={event.signup_count || 0}
                  onClick={() => navigate(`/events/${event.id}`)}
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
