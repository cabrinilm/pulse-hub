import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Settings = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Link to="/profile/edit" className="text-blue-500">Edit Profile</Link>
      <Navbar />
    </div>
  );
};

export default Settings;