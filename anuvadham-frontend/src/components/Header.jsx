import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaInfoCircle, FaClock, FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="https://github.com/kusujanakiram/Realtime-Translation/blob/main/anuvadham-frontend/images/AnuvadhamLogo.png?raw=true" alt="Logo" />
          <span>Anuvadham</span>
        </div>

        <nav className="nav">
          <a href="/about" className="nav-link hide-on-mobile">About</a>
          <a href="/history" className="nav-link hide-on-mobile">History</a>

          <div className="profile" ref={dropdownRef}>
            <FaUserCircle className="icon" onClick={() => setOpen(!open)} />
            {open && (
              <div className="dropdown">
                <div className="dropdown-arrow" />
                <a href="/home"><FaHome /> Home</a>
                <a href="/about"><FaInfoCircle /> About</a>
                <a href="/history"><FaClock /> History</a>
                <a href="/profile"><FaUser /> View Profile</a>
                <a onClick={handleLogout}><FaSignOutAlt /> Logout</a>
              </div>
            )}
          </div>
        </nav>
      </header>

      {open && <div className="overlay" />}
    </>
  );
}
