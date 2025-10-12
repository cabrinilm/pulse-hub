// src/pages/CreateEvent.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // formato yyyy-MM-ddTHH:mm
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    if (!title || !date) {
      setError('Title and date are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/events', {
        title,
        description,
        event_date: date,
        location,
        creator_id: user.id, // garante que o evento pertence ao usuário
      });
      navigate('/my-events'); // volta para My Events
    } catch (err: any) {
      setError(err.message || 'Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 md:ml-[18rem] mt-16 md:mt-24">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Create Event</h1>

      <div className="flex flex-col gap-4 max-w-xl">
        <input
          type="text"
          placeholder="Title"
          className="border rounded p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="border rounded p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="datetime-local"
          className="border rounded p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          className="border rounded p-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <Button
          onClick={handleCreate}
        //   disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </Button>
      </div>

      <Navbar />
    </div>
  );
};

export default CreateEvent;
