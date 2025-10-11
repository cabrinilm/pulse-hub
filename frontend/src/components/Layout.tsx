import Header from './Header';
import Navbar from './Navbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      {children}
      <Navbar />
    </div>
  );
};

export default Layout;