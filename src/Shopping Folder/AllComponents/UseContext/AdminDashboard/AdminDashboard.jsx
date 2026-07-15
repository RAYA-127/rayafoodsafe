import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { FaUtensils, FaUserCheck, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const baseWebUrl = "https://script.google.com/macros/s/AKfycbzuNOEQ1PfE2ISH_yi_09QFtCmrWgaVa4d9HG3A0NniNKj8FvFD7xBaSajCuM6W7FS2/exec";
  
  // 1. Your EmailJS Credentials (as configured in CartPage)
  const SERVICE_ID = "service_29nizw2"; 
  const CUSTOMER_TEMPLATE_ID = "template_tu1yrmf"; // Create this in EmailJS
  const PUBLIC_KEY = "iRFZFTg7KH47GGIWb"; 

  // 2. Local State Management
  const [orders, setOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("M.Rakesh"); // Default dispatcher
  const [loading, setLoading] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // Available drivers/team members
  const teamMembers = [
    { name: "M.Rakesh", email: "rakeshramcharan3@gmail.com" },
    { name: "Team Member 1", email: "24jr1a05av@gmail.com" }
  ];

  // 3. Fetch active orders from Google Sheets on load
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Calls your Google Apps Script database to pull pending orders
      const response = await fetch(`${baseWebUrl}?action=getPendingOrders`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setOrders(data);
      } else {
        // Fallback mock data for testing/UI layout validation
        setOrders([
          {
            orderId: "RAYA-1234567890",
            customerName: "Rakesh",
            customerEmail: "rakeshramcharan3@gmail.com",
            customerLocation: "94-12-9/5/1, Ramireddy Nagar, Guntur",
            orderDetails: "1x Poori (₹40), 1x Dosa (₹45)",
            status: "Pending"
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching orders from Google Sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 4. Handle accepting/taking the order
  const handleTakeOrder = async (order) => {
    setProcessingOrderId(order.orderId);

    // Get current dispatcher info based on selected option
    const activeDriver = teamMembers.find(member => member.name === selectedDriver);

    // Setup template params matching your customer-facing EmailJS template
    const customerTemplateParams = {
      order_id: order.orderId,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_location: order.customerLocation,
      driver_name: activeDriver.name,
    };

    try {
      // A. Send confirmation email to the CUSTOMER
      await emailjs.send(
        SERVICE_ID,
        CUSTOMER_TEMPLATE_ID,
        customerTemplateParams,
        PUBLIC_KEY
      );
      console.log(`Success! Notification email dispatched to ${order.customerEmail}`);

      // B. Update Order Status in Google Sheets Database
      const updateUrl = `${baseWebUrl}?action=updateOrderStatus&orderId=${order.orderId}&status=Accepted&driverName=${encodeURIComponent(activeDriver.name)}`;
      await fetch(updateUrl, { method: 'POST', mode: 'no-cors' });

      alert(`Order taken! A notification email has been sent to ${order.customerName} stating that ${activeDriver.name} is delivering it!`);
      
      // Refresh local UI status state
      setOrders(prevOrders => 
        prevOrders.map(o => o.orderId === order.orderId ? { ...o, status: "Accepted", driver: activeDriver.name } : o)
      );

    } catch (err) {
      console.error("Failed to accept order workflow:", err);
      alert("Failed to process taking the order. Check console or your EmailJS configurations.");
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>Raya Foods Admin Console</h2>
        <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* Driver/Dispatcher Identity Selector */}
      <div className="driver-selector-card">
        <label htmlFor="driver-select">
          <FaUserCheck className="icon" /> <strong>Active Dispatcher Identity:</strong>
        </label>
        <select 
          id="driver-select" 
          value={selectedDriver} 
          onChange={(e) => setSelectedDriver(e.target.value)}
        >
          {teamMembers.map((member, idx) => (
            <option key={idx} value={member.name}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>
        <p className="helper-text">This is the name that will be dynamically emailed to the client upon taking an order.</p>
      </div>

      {/* Order Listings Grid */}
      <div className="orders-list">
        <h3>Active System Orders</h3>
        {orders.length === 0 ? (
          <p className="no-orders-msg">No pending food orders discovered at this time.</p>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className={`order-card ${order.status.toLowerCase()}`}>
              <div className="order-card-header">
                <span className="order-tag">ID: {order.orderId}</span>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-card-body">
                <p><strong>Customer:</strong> {order.customerName} ({order.customerEmail})</p>
                <p className="details-text"><strong>Items ordered:</strong> {order.orderDetails}</p>
                
                <p className="location-text">
                  <FaMapMarkerAlt className="location-icon" /> 
                  <strong>Address:</strong> {order.customerLocation}
                </p>

                {order.driver && (
                  <p className="driver-assigned">
                    <FaCheckCircle className="assigned-icon" /> Taken by: <strong>{order.driver}</strong>
                  </p>
                )}
              </div>

              <div className="order-card-footer">
                <button 
                  className="take-order-action-btn"
                  onClick={() => handleTakeOrder(order)}
                  disabled={processingOrderId === order.orderId || order.status === "Accepted"}
                >
                  <FaUtensils /> {processingOrderId === order.orderId ? "Processing..." : order.status === "Accepted" ? "Order Accepted" : "Take Order Now"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;