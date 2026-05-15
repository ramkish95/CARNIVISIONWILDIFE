import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { Shield, Map as MapIcon, Camera, Bell, User, LogOut, Activity } from 'lucide-react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import { ToastContainer, toast } from 'react-toastify'; // New Imports
import 'react-toastify/dist/ReactToastify.css'; // Toast Styles
import './App.css';

const API_BASE = "http://localhost:8080/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sightings, setSightings] = useState([]);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use a ref to track the previous count without triggering re-renders
  const prevCountRef = useRef(0);

  const fetchSightings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sightings/recent`);
      const newSightings = res.data;
      
      // ALERT LOGIC: If the new list is longer than the old list, alert the ranger!
      if (newSightings.length > prevCountRef.current && prevCountRef.current !== 0) {
        const latest = newSightings[newSightings.length - 1];
        
        toast.error(`⚠️ DANGER: ${latest.species.toUpperCase()} detected!`, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
        
        // Optional: Play a subtle alert sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Audio play blocked by browser"));
      }
      
      setSightings(newSightings);
      prevCountRef.current = newSightings.length;
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchSightings(); 
      const interval = setInterval(fetchSightings, 5000); 
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // ... (handleRequestOtp and handleVerifyOtp remain the same) ...
  const handleRequestOtp = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/otp/generate`, { email });
      setMessage("Success! Check your Gateway console.");
    } catch (err) {
      setMessage("Connection error. Is the Gateway running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/otp/verify`, { email, otp });
      if (res.data.includes("Successful")) {
        setIsLoggedIn(true);
      }
    } catch (err) {
      setMessage("Invalid security code.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-overlay">
        {/* ... Login UI code ... */}
        <div className="login-card">
          <div className="brand">
            <Shield size={40} color="#4CAF50" strokeWidth={3} />
            <h1>WILD-GUARD AI</h1>
            <p>Enterprise Wildlife Management</p>
          </div>
          <div className="status-msg">{message}</div>
          <div className="auth-group">
            <input type="email" placeholder="Guardian Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="primary-btn" onClick={handleRequestOtp} disabled={isLoading}>
              {isLoading ? "Sending..." : "Request Access"}
            </button>
          </div>
          <div className="auth-group">
            <input type="text" placeholder="6-Digit OTP" value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value)} />
            <button className="secondary-btn" onClick={handleVerifyOtp}>Verify & Enter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {/* 1. Global Alert Container */}
      <ToastContainer /> 

      <nav className="sidebar">
        <div className="nav-logo"><Shield color="#4CAF50" /></div>
        <div className="nav-links">
          <button className="active"><MapIcon size={20} /></button>
          <button><Camera size={20} /></button>
          <button><Bell size={20} /></button>
          <button><User size={20} /></button>
        </div>
        <button className="logout-btn" onClick={() => setIsLoggedIn(false)}><LogOut size={20} /></button>
      </nav>

      <main className="command-center">
        <header className="iccc-header">
          <div className="title-section">
            <h2>ICCC Dashboard</h2>
            <span className="location-tag">Sector: Bandipur NP</span>
          </div>
          <div className="system-status">
            <Activity size={16} color="#4CAF50" />
            <span>AI Node: ONLINE ({sightings.length} Sightings)</span>
          </div>
        </header>

        <section className="map-viewport">
          <MapComponent sightings={sightings} />
        </section>
      </main>
    </div>
  );
}

export default App;