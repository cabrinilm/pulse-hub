// src/pages/EditEvent.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

interface Event {
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
}

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  if (loading) return <p className="p-4 text-center">Loading...</p>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Edit Event</h1>

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
  );
};

export default EditEvent;
