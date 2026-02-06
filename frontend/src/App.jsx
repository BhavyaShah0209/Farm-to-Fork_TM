import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import Login from "./pages/Login";
import Market from "./pages/Market";
import Traceability from "./pages/Traceability";
import ListingDetails from "./pages/ListingDetails";
import FarmerDashboard from "./pages/FarmerDashboard";
import Orders from "./pages/Orders";
import NotificationToast from "./components/NotificationToast";

import "./AppModern.css";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // Google Translate init
  useEffect(() => {
  if (window.google && window.google.translate) return;

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,hi,fr,de,zh",
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element"
    );
  };

  if (!document.getElementById("google-translate-script")) {
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }
}, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Farm2Fork
        </Link>

        {/* Google Translate widget */}
        <div id="google_translate_element"></div>

        <nav className="navbar-links">
          <Link to="/" className={`nav-link ${isActive("/")}`}>
            Market
          </Link>
          <Link to="/orders" className={`nav-link ${isActive("/orders")}`}>
            Orders
          </Link>
          <Link
            to="/farmer-dashboard"
            className={`nav-link ${isActive("/farmer-dashboard")}`}
          >
            Dashboard
          </Link>
          <Link
            to="/traceability"
            className={`nav-link ${isActive("/traceability")}`}
          >
            Traceability
          </Link>

          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn btn-primary nav-btn">
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary nav-btn">
              Login
            </Link>
          )}
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
            <Route
              path="/farmer-dashboard"
              element={<FarmerDashboard />}
            />
            <Route path="/orders" element={<Orders />} />
            <Route path="/traceability" element={<Traceability />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;