// src/pages/EditEvent.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Button from '../components/Button';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
}

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formata para datetime-local
  const formatForInput = (isoString: string) => {
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get<Event>(`/events/${id}`);
        setEvent(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setEventDate(formatForInput(res.data.event_date));
        setLocation(res.data.location || '');
      } catch (err: any) {
        setError(err.message || 'Error loading event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/events/${id}`, {
        title,
        description,
        event_date: eventDate,
        location,
      });
      setSuccess('Event updated successfully!');
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

  if (loading || !event) return <p className="p-4 text-center">Loading...</p>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-6 mt-16 md:mt-24">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>

      <div className="flex flex-col gap-4 bg-white rounded-xl shadow-md p-6">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Title</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-semibold">Description</span>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border rounded px-3 py-2"
            rows={4}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-semibold">Date & Time</span>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-semibold">Location</span>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </label>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button variant="primary" onClick={handleUpdate} className="w-full sm:w-auto">
            Save Changes
          </Button>
          <Button variant="secondary" onClick={handleDelete} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white">
            Delete Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
