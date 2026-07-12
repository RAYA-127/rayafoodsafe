import React from 'react';
import { FaUserCircle, FaMapMarkerAlt, FaShoppingBag } from "react-icons/fa";
import { useCart } from '../AllComponents/UseContext/CartContext'; // Adjust path if needed
import { Link } from 'react-router-dom';


export const Profile = () => {
  const { user, logout} = useCart();



  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px', maxWidth: '400px', margin: '40px auto' }}>
        <h2>No Active Session Found</h2>
        <p style={{ color: '#7f8c8d', margin: '15px 0' }}>
          Please sign in to view your profile dashboard account statistics.
        </p>
        <Link to="/Sign In">
          <button style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Go to Sign In</button>
        </Link>
      </div>
    );
  }




  return (
    
    <div className="profile-container">
      <div className="profile-sidebar">
        <FaUserCircle size={80} className="profile-avatar" />
        <h2>{user.name}</h2>
        <p className="email-text">{user.email}</p>
        <button className="logout-btn" onClick={logout}>Log Out</button>
      </div>

      <div className="profile-content">
        <div className="info-card">
          <h3><FaMapMarkerAlt /> Saved Address</h3>
          <p>12-34 Main Street, Beach Road Area, Visakhapatnam, Andhra Pradesh, 530003</p>
        </div>

        <div className="info-card">
          <h3><FaShoppingBag /> Recent Orders</h3>
          <div className="recent-order-item">
            <div>
              <strong>Order #88214</strong>
              <p className="order-date">Today, 7:15 PM</p>
            </div>
            <span className="status-badge delivered">Delivered</span>
          </div>
          <div className="recent-order-item">
            <div>
              <strong>Order #87691</strong>
              <p className="order-date">Yesterday</p>
            </div>
            <span className="status-badge delivered">Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

