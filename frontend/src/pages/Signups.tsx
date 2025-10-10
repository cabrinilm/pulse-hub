import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';

interface Signup {
  event_id: string;
  presence_status: string;
  events: {
    title: string;
    event_date: string;
  };
}

const Signups = () => {
  const [signups, setSignups] = useState<Signup[]>([]);

  useEffect(() => {
    const fetchSignups = async () => {
      try {
        const res = await api.get<Signup[]>('/signups');
        setSignups(res.data);
      } catch (err) {
        console.error('Error fetching signups:', err);
      }
    };
    fetchSignups();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">My Signups</h1>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {signups.map((signup) => (
          <Card key={signup.event_id} title={signup.events.title} description="" date={signup.events.event_date} location="" signup_count={0} />
        ))}
      </div>
      <Navbar />
    </div>
  );
};

export default Signups;