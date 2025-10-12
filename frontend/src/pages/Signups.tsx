// src/pages/Signups.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import PaginationDots from '../components/PaginationDots';
import { useSwipeable } from 'react-swipeable';
import AddToCalendarButton from '../components/AddToCalendarButton';
import BackArrow from '../components/BackArrow';

interface Signup {
  event_id: string;
  presence_status: string;
  events: {
    title: string;
    event_date: string;
    location?: string | null;
    description?: string | null;
    time?: string | null;
  };
}

const Signups = () => {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const signupsPerPage = 3;
  const navigate = useNavigate();
  const location = useLocation();

  const previousPage = location.state?.from || '/';

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
    <div className="p-3 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-24 relative">
      {/* BackArrow visível apenas em mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Título seguindo o mesmo padrão */}
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">My Signups</h1>

      {/* Área de swipe */}
      <div {...swipeHandlers} className="flex flex-col gap-6">
        {currentSignups.map((signup) => (
          <div key={signup.event_id}>
            <Card
              title={signup.events.title}
              date={signup.events.event_date}
              location={signup.events.location || ''}
              signup_count={0}
              onClick={() => navigate(`/events/${signup.event_id}`, { state: { from: location.pathname } })}
            />

            {/* Botão "Add to Google Calendar" */}
            <AddToCalendarButton
              event={{
                title: signup.events.title,
                description: signup.events.description || '',
                date: signup.events.event_date,
                time: signup.events.time || '',
                location: signup.events.location || '',
              }}
              isVisible={true}
            />
          </div>
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
