import React, { useState, useEffect } from 'react';
import { FaPhoneAlt, FaUser, FaClock, FaMotorcycle } from 'react-icons/fa';
import './DriverStatusCard.css';

// ── Your team details — matched by email ─────────────────────
const TEAM = {
  "rakeshramcharan3@gmail.com": {
    name: "Manepalli Rakesh",
    phone: "9063668256",
    gmail: "rakeshramcharan3@gmail.com"
  },
  "24r1a05av@gmail.com": {
    name: "Honey",
    phone: "9398412673",
    gmail: "24r1a05av@gmail.com"
  },
  "manepallirakesh6059@gmail.com": {
    name: "Ram",
    phone: "9922771752",
    gmail: "manepallirakesh6059@gmail.com"
  }
};

const DriverStatusCard = ({ orderId }) => {
  const [assignedDriver, setAssignedDriver] = useState(null);

  const baseWebUrl = "https://script.google.com/macros/s/AKfycbzuNOEQ1PfE2ISH_yi_09QFtCmrWgaVa4d9HG3A0NniNKj8FvFD7xBaSajCuM6W7FS2/exec";

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const url      = `${baseWebUrl}?action=checkOrderStatus&orderId=${orderId}`;
        const response = await fetch(url);
        const data     = await response.json();

        // Google Sheet saves: "Claimed by rakeshramcharan3@gmail.com"
        // So we read the status string and extract the email from it
        const statusRaw = (data.status || "").trim();

        // Check if any teammate's email appears inside the status string
        const matched = Object.values(TEAM).find(member =>
          statusRaw.toLowerCase().includes(member.gmail.toLowerCase())
        );

        if (matched) {
          setAssignedDriver(matched);
          clearInterval(interval); // Stop polling — driver found!
        } else {
          setAssignedDriver(null); // Still waiting
        }

      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  // ── LOADING — waiting for teammate to click Take Order Now ──
  if (!assignedDriver) {
    return (
      <div className="status-card-waiting">
        <div className="spinner"></div>
        <p>⏳ Waiting for Raya Foods team to accept your order...</p>
        <span style={{ fontSize: '11px', color: '#aaa', marginTop: '6px', display: 'block' }}>
          We will notify you as soon as someone picks up your order.
        </span>
      </div>
    );
  }

  // ── DRIVER FOUND — teammate clicked Take Order Now ──────────
  return (
    <div className="driver-status-card-container">

      <div className="card-header-badge">
        <FaMotorcycle className="bike-icon" />
        <span>Raya Foods Delivery Partner Assigned ✅</span>
      </div>

      <div className="driver-profile-info">
        <div className="driver-avatar">
          <FaUser size={24} />
        </div>
        <div className="driver-meta">
          <h4>{assignedDriver.name}</h4>
          <p className="delivery-time">
            <FaClock size={12} /> Delivering within 10–15 mins
          </p>
        </div>
      </div>

      <div className="contact-action-area">
        <div className="phone-display">
          <span>Contact Number:</span>
          <strong>{assignedDriver.phone}</strong>
        </div>
        <div className="phone-display">
          <span>Email:</span>
          <strong>{assignedDriver.gmail}</strong>
        </div>
        <a href={`tel:${assignedDriver.phone}`} className="dial-button-link">
          <FaPhoneAlt size={14} /> Dial
        </a>
      </div>

    </div>
  );
};

export default DriverStatusCard;
