import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import BackArrow from '../components/BackArrow';
import Lottie from 'lottie-react';
import loadingAnimation from '../lottie/Trail_lottie.json';

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const previousPage = location.state?.from || '/my-events';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // yyyy-MM-ddTHH:mm
  const [locationInput, setLocationInput] = useState('');
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
        location: locationInput,
        creator_id: user.id,
      });
      navigate('/my-events');
    } catch (err: any) {
      setError(err.message || 'Error creating event');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Lottie animationData={loadingAnimation} loop className="w-64 h-64" />
      </div>
    );

  return (
    <div className="p-4 md:p-8 md:ml-[18rem] mt-14 md:mt-24 relative">
 
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center md:text-left text-white">Create Event</h1>

      <div className="flex flex-col gap-4 max-w-xl bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-md">
        <input
          type="text"
          placeholder="Title"
          className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="datetime-local"
          className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <Button
          onClick={handleCreate}
          className="bg-teal-500 hover:bg-teal-600 text-white w-full md:w-auto px-4 py-2 rounded transition-colors duration-200"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </Button>
      </div>

      <Navbar />
    </div>
  );
};

export default CreateEvent;
