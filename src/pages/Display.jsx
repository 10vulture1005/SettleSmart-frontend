import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import './display.css'
import Dashboard from './display pages/dashboard';
import Friends from './display pages/Friends';
import Plans from './display pages/Plans';
import ContactPage from './display pages/Contact';
import OutingPlannerPage from './display pages/Planner';
const Display = () => {
  const [activeNavItem, setActiveNavItem] = useState('Dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const id = 10
  const [user,setUser] = useState({
    name:"username",
    email:"example@gmail.com"
  })
  const navigate = useNavigate();
  
  const componentMap = {
    Dashboard: <Dashboard  />,
    Plans: <Plans/>,
    Analytics: <div style={{ color: 'white' }}>{id}</div>,
    Friends: <Friends friendRequests={friendRequests} setFriendRequests={setFriendRequests} setHasNewRequests={setHasNewRequests} />,
    'Contact me': <ContactPage/>,
    Planer: <OutingPlannerPage/>,
  };

  const handleSignout = async() => {
    await axios.post(`${import.meta.env.VITE_BASE_URI}/auth/logout`, {}, { withCredentials: true });
    navigate('/');
  }

  // Function to fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URI}/friend/requests/sent`, { withCredentials: true });
      const newRequests = res.data;
      
      // Check if there are new requests compared to the current state
      if (newRequests.length > friendRequests.length) {
        setHasNewRequests(true);
      }
      
      setFriendRequests(newRequests);
    } catch (err) {
      console.log('Error fetching friend requests:', err);
    }
  };
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URI}/user/data`, { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
    fetchFriendRequests(); // Initial fetch

    // Set up polling for friend requests every 30 seconds
    const friendRequestInterval = setInterval(fetchFriendRequests, 30000);

    // Scroll handler for hiding/showing navbar
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide header on mobile/tablet (when mobile header is visible)
      if (window.innerWidth <= 1024) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down and past 100px
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          setIsHeaderVisible(true);
        }
        
        // Always show header at the top
        if (currentScrollY <= 10) {
          setIsHeaderVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animate progress bars on load
    const timer = setTimeout(() => {
      const progressBars = document.querySelectorAll('.progress-fill');
      progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
          bar.style.width = width;
        }, 500);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(friendRequestInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, friendRequests.length]);

  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
    setIsMobileSidebarOpen(false); // Close sidebar on mobile after selection
    
    // Clear notification when Friends is clicked
    if (navItem === 'Friends') {
      setHasNewRequests(false);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const navItems = [
    { name: 'Dashboard', href: '#' },
    { name: 'Plans', href: '#' },
    { name: 'Friends', href: '#' },
    { name: 'Contact me', href: '#' },
        { name: 'Planer', href: '#' },

  ];

  return (
    <div className='layout'>
      {/* Mobile Header */}
      <div className={`mobile-header ${isHeaderVisible ? 'visible' : 'hidden'}`}>
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobileSidebar}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <h1 className="mobile-title">Smart Settlement</h1>
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Smart Settlement</h1>
          <button 
            className="mobile-close-btn"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`nav-item ${activeNavItem === item.name ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.name);
              }}
            >
              {item.name}
              {item.name === 'Friends' && hasNewRequests && (
                <span className="notification-badge">{friendRequests.length}</span>
              )}
            </a>
          ))}
          <a onClick={handleSignout} className="nav-item sign-out">Sign out</a>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">{user.name.substring(0,2).toUpperCase()}</div>
          <div className="user-details">
            <div className="username">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {componentMap[activeNavItem] || <div style={{ color: 'white' }}>dsfsdf</div>}
      </main>
    </div>
  );
};

export default Display;