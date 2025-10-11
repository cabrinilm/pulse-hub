import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <>
     {/* Mobile Bottom Bar */}
<nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-4 md:hidden z-10 rounded-t-2xl shadow-md">
  {[
    { to: '/', label: 'Home', icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0H7m-4 0" />)},
    { to: '/events', label: 'Events', icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />)},
    { to: '/signups', label: 'Signups', icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />)},
    { to: '/my-events', label: 'My Events', icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 110-4m0 4v-2a2 2 0 100 4m0-4a2 2 0 100 4m6 8.74l-6-4-6 4V21h12v-2.26z" />)},
    { to: '/settings', label: 'Settings', icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    )}
  ].map(({ to, label, icon }) => (
    <Link
      key={to}
      to={to}
      className="flex flex-col items-center text-gray-600 hover:text-blue-500"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
      <span className="text-sm sm:block hidden">{label}</span>
    </Link>
  ))}
</nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-4 top-24 bottom-6 w-64 bg-white border rounded-2xl shadow-md p-5 gap-5 z-10 overflow-y-auto">
        <h1 className="text-lg font-semibold text-gray-700 mb-3">Menu</h1>

        {[
          { to: '/', label: 'Home' },
          { to: '/events', label: 'Events' },
          { to: '/signups', label: 'Signups' },
          { to: '/my-events', label: 'My Events' },
          { to: '/settings', label: 'Settings' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-100 transition"
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
