import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Market from './pages/Market';
import Traceability from './pages/Traceability';
import ListingDetails from './pages/ListingDetails';
import FarmerDashboard from './pages/FarmerDashboard';
import Orders from './pages/Orders';
import NotificationToast from './components/NotificationToast'; // Import Notification
import './AppModern.css';

// Navbar Component to handle active states nicely
const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Farm2Fork</Link>
        <nav className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Market</Link>
          <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>Orders</Link>
          <Link to="/farmer-dashboard" className={`nav-link ${isActive('/farmer-dashboard')}`}>Dashboard</Link>
          <Link to="/traceability" className={`nav-link ${isActive('/traceability')}`}>Traceability</Link>
          <Link to="/login" className="btn btn-primary nav-btn">Login</Link>
        </nav>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-layout">
        <NotificationToast />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Market />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/traceability" element={<Traceability />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
