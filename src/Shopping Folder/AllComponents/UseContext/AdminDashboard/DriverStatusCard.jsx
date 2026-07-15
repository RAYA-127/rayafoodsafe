import React, { useState, useEffect } from 'react';
import { FaPhoneAlt, FaUser, FaClock, FaMotorcycle } from 'react-icons/fa';
import './DriverStatusCard.css';

// Your team details[cite: 2]
const TEAM = {
  rakesh: {
    gmail:"rakeshramcharan3@gmail.com",
    name: "Manepalli Rakesh",
    phone: "9063668256"
  },
  honey: {
    gmail:"24r1a05av@gmail.com",
    name: "Honey",
    phone: "9398412673"
  }
};

const DriverStatusCard = ({ orderId }) => {
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [debugRawData, setDebugRawData] = useState(""); // For emergency troubleshooting
  const baseWebUrl = "https://script.google.com/macros/s/AKfycbzuNOEQ1PfE2ISH_yi_09QFtCmrWgaVa4d9HG3A0NniNKj8FvFD7xBaSajCuM6W7FS2/exec";

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const checkUrl = `${baseWebUrl}?action=checkOrderStatus&orderId=${orderId}`;
        const response = await fetch(checkUrl);
        const data = await response.json();

        // 1. Keep a string copy of whatever the database returned
        const stringifiedData = JSON.stringify(data).toLowerCase();
        setDebugRawData(JSON.stringify(data));

        // 2. BULLETPROOF SEARCH: Search the entire database response text for your team emails
        if (stringifiedData.includes("rakeshramcharan3@gmail.com") || stringifiedData.includes("rakesh")) {
          setAssignedDriver(TEAM.rakesh);
        } else if (stringifiedData.includes("24jr1a05av@gmail.com") || stringifiedData.includes("honey")) {
          setAssignedDriver(TEAM.honey);
        } else {
          // If no driver email is found in the response, keep waiting
          setAssignedDriver(null);
        }
      } catch (error) {
        console.error("Error fetching live driver status:", error);
      }
    }, 3000); // Polls every 3 seconds for fast updates

    return () => clearInterval(interval);
  }, [orderId]);

  // If we haven't found a driver in the database yet, keep showing the loading state
  if (!assignedDriver) {
    return (
      <div className="status-card-waiting">
        <div className="spinner"></div>
        <p>Waiting for Raya Foods team to accept your order...</p>
        
        {/* Hidden debug log in case you need to inspect what your Google Sheet is returning */}
        <span style={{ fontSize: '10px', color: '#ccc', marginTop: '10px' }}>
          ID: {orderId} | Live Data: {debugRawData || "Connecting to server..."}
        </span>
      </div>
    );
  }

  // Once a team member accepts, show their details with the Dial button!
  return (
    <div className="driver-status-card-container">
      <div className="card-header-badge">
        <FaMotorcycle className="bike-icon" />
        <span>Raya Foods Delivery Partner Assigned</span>
      </div>

      <div className="driver-profile-info">
        <div className="driver-avatar">
          <FaUser size={24} />
        </div>
        <div className="driver-meta">
          <h4>{assignedDriver.name}</h4>
          <p className="delivery-time">
            <FaClock size={12} /> Delivering within 10-15 mins
          </p>
        </div>
      </div>

      <div className="contact-action-area">
        <div className="phone-display">
          <span>Contact Number:</span>
          <strong>{assignedDriver.phone}</strong>
        </div>

         <div className="phone-display">
          <span>Contact Number:</span>
          <strong>{assignedDriver.gmail}</strong>
        </div>

        
        
        {/* Working Dial Button */}
        <a 
          href={`tel:${assignedDriver.phone}`} 
          className="dial-button-link"
        >
          <FaPhoneAlt size={14} /> Dial
        </a>
      </div>
    </div>
  );
};

export default DriverStatusCard;