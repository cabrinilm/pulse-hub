// src/pages/Signups.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import PaginationDots from '../components/PaginationDots';
import { useSwipeable } from 'react-swipeable';

interface Signup {
  event_id: string;
  presence_status: string;
  events: {
    title: string;
    event_date: string;
    location?: string | null;
  };
}

const Signups = () => {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const signupsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSignups = async () => {
      try {
        const res = await api.get<Signup[]>('/signups');
        setSignups(res.data || []);
      } catch (err) {
        console.error('Error fetching signups:', err);
      }
    };
    fetchSignups();
  }, []);

  const totalPages = Math.max(1, Math.ceil(signups.length / signupsPerPage));
  const indexOfLastSignup = currentPage * signupsPerPage;
  const indexOfFirstSignup = indexOfLastSignup - signupsPerPage;
  const currentSignups = signups.slice(indexOfFirstSignup, indexOfLastSignup);

  // Swipe handlers
  const goNext = useCallback(() => setCurrentPage(p => Math.min(p + 1, totalPages)), [totalPages]);
  const goPrev = useCallback(() => setCurrentPage(p => Math.max(p - 1, 1)), []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => totalPages > 1 && goNext(),
    onSwipedRight: () => totalPages > 1 && goPrev(),
    trackTouch: true,
    trackMouse: true,
    delta: 50,
  });

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="p-3 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-24">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">My Signups</h1>

      {/* Área de swipe */}
      <div {...swipeHandlers} className="flex flex-col gap-6">
        {currentSignups.map((signup) => (
          <Card
            key={signup.event_id}
            title={signup.events.title}
            date={signup.events.event_date}
            location={signup.events.location || ''}
            signup_count={0}
            onClick={() => navigate(`/events/${signup.event_id}`)}
          />
        ))}
      </div>

      {/* Paginação por bolinhas */}
      <div className="fixed bottom-4 left-0 w-full flex justify-center md:static md:mt-6">
        <PaginationDots
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <Navbar />
    </div>
  );
};

export default Signups;
