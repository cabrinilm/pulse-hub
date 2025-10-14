// src/pages/EditEvent.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import BackArrow from '../components/BackArrow';

interface Event {
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
}

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const previousPage = location.state?.from || '/';

  const [eventData, setEventData] = useState<Event>({
    title: '',
    description: '',
    event_date: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get<Event>(`/events/${id}`);
        // Ajuste da data para o input type="datetime-local"
        const date = new Date(res.data.event_date);
        const iso = date.toISOString().slice(0, 16);
        setEventData({ ...res.data, event_date: iso });
      } catch (err: any) {
        setError(err.message || 'Error fetching event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/events/${id}`, eventData);
      setSuccess('Event updated successfully!');
      // Redireciona para MyEvents
      navigate('/my-events');
    } catch (err: any) {
      setError(err.message || 'Error updating event');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/my-events');
    } catch (err: any) {
      setError(err.message || 'Error deleting event');
    }
  };

  if (loading) return <p className="p-4 text-center text-white">Loading...</p>;

  return (
    <div className="flex flex-col p-3 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-10 md:mt-16 relative min-h-screen">
      {/* BackArrow Mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Header */}
      <div className="hidden md:flex items-center gap-4 mb-6">
        <BackArrow to={previousPage} animateOnClick />
        <h1 className="text-3xl font-bold text-white">Edit Event</h1>
      </div>
      <h1 className="md:hidden text-2xl font-bold mb-4 text-center text-white">Edit Event</h1>

      <div className="flex flex-1 items-center justify-start md:justify-center px-4 sm:px-0">
        <div className="relative z-10 w-full max-w-lg bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-4">
          <motion.h2
            className="text-3xl font-bold text-white text-center mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
          >
            Edit Event
          </motion.h2>

          {error && (
            <p className="text-red-400 text-sm mt-1 text-center">{error}</p>
          )}

          <div className="flex flex-col gap-4 w-full">
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="Event Title"
              className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            />

            <textarea
              name="description"
              value={eventData.description || ''}
              onChange={handleChange}
              placeholder="Event Description"
              rows={4}
              className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors resize-none"
            />

            <input
              type="datetime-local"
              name="event_date"
              value={eventData.event_date}
              onChange={handleChange}
              className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            />

            <input
              type="text"
              name="location"
              value={eventData.location || ''}
              onChange={handleChange}
              placeholder="Event Location"
              className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            />

            {success && (
              <p className="text-green-400 text-sm mt-1 text-center">{success}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleUpdate}
                className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-3 rounded-xl w-full font-medium transition-all cursor-pointer"
              >
                Update Event
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-400 hover:bg-red-500 text-white px-4 py-3 rounded-xl w-full font-medium transition-all cursor-pointer"
              >
                Delete Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default EditEvent;