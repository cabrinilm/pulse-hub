// src/pages/EditEvent.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    <div className="p-3 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-24 relative">
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

      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <label className="flex flex-col gap-1">
          Title
          <input
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          Description
          <textarea
            name="description"
            value={eventData.description || ''}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          Date
          <input
            type="datetime-local"
            name="event_date"
            value={eventData.event_date}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          Location
          <input
            type="text"
            name="location"
            value={eventData.location || ''}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </label>

        <div className="flex gap-4 mt-4">
          <Button variant="primary" onClick={handleUpdate}>Update Event</Button>
          <Button variant="secondary" onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete Event</Button>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default EditEvent;