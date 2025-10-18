import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AuthButton from '../components/AuthButton';
import { motion } from 'framer-motion';
import BackArrow from '../components/BackArrow';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const previousPage = location.state?.from || '/';
  const appVersion = '1.0.0';

  return (
    <div className="p-3 md:p-8 pb-24 md:pb-8 md:ml-[18rem] mt-14 md:mt-6 relative">
      {/* BackArrow Mobile */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <BackArrow to={previousPage} animateOnClick />
      </div>

      {/* Header */}
      <div className="hidden md:flex items-center gap-4 mb-4"> 
        <BackArrow to={previousPage} animateOnClick />
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>
      <h1 className="md:hidden text-2xl font-bold mb-4 text-center text-white">Settings</h1>

      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        {/* App Info / Version */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="p-4 border rounded bg-white/10 backdrop-blur-md shadow-md"
        >
          <h2 className="font-semibold text-white">App Info</h2>
          <p className="mt-1 text-white">Version: {appVersion}</p>
        </motion.div>

        {/* Edit Profile */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="p-4 border rounded bg-white/10 backdrop-blur-md shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0"
        >
          <span className="font-medium text-white">Edit Profile</span>
          <AuthButton
            onClick={() => navigate('/profile/edit')}
          >
            Edit
          </AuthButton>
        </motion.div>

        {/* Logout */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
          className="p-4 border rounded bg-white/10 backdrop-blur-md shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0"
        >
          <span className="font-medium text-white">Logout</span>
          <button
            onClick={() => alert('Logging out')}
            className={`
              px-6 py-2 rounded-lg font-medium
              bg-red-500 hover:bg-red-600 active:scale-95
              transition-all duration-200
              cursor-pointer
              w-full sm:w-auto
            `}
          >
            Logout
          </button>
        </motion.div>
      </div>

      <Navbar />
    </div>
  );
};

export default Settings;
