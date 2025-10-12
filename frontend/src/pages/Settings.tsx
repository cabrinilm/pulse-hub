// src/pages/Settings.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<'en' | 'pt'>('en');
  const navigate = useNavigate();

  const appVersion = '1.0.0';

  return (
    <div
      className={`min-h-screen p-4 md:p-8 md:ml-[18rem] mt-16 md:mt-24 transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      }`}
    >
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Settings</h1>

      <div className="flex flex-col gap-6 max-w-xl">
        {/* Dark / Light Mode */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center p-4 border rounded"
        >
          <span>Theme</span>
          <Button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded ${
              isDark ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'
            }`}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </motion.div>

        {/* Language Switch */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          className="flex justify-between items-center p-4 border rounded"
        >
          <span>Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'pt')}
            className="border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </motion.div>

        {/* App Info / Version */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="p-4 border rounded"
        >
          <h2 className="font-semibold">App Info</h2>
          <p className="mt-1">Version: {appVersion}</p>
        </motion.div>

        {/* Edit Profile */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="p-4 border rounded flex justify-between items-center"
        >
          <span>Edit Profile</span>
          <Button
            onClick={() => navigate('/profile/edit')}
            className="px-4 py-2"
          >
            Edit
          </Button>
        </motion.div>

        {/* Logout */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
          className="p-4 border rounded flex justify-between items-center"
        >
          <span>Logout</span>
          <Button
            onClick={() => alert('Logging out')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        </motion.div>
      </div>

      <Navbar />
    </div>
  );
};

export default Settings;
