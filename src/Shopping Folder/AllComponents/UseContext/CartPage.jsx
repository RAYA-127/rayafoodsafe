import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext'; 
import { FaUser, FaWallet, FaPlus, FaMinus, FaMapMarkerAlt } from 'react-icons/fa';
import emailjs from '@emailjs/browser'; 
import './CartPage.css';
import './Livetracking.css';
// Strip out your old local useState tracking declaration and pull everything from context:
const CartPage = () => {
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    user, 
    clearCart,
    placedOrderCoordinates,       // Moved up to context level
    setPlacedOrderCoordinates     // Moved up to context level
  } = useCart();
  
  const navigate = useNavigate(); 
  const baseWebUrl = "https://script.google.com/macros/s/AKfycbzuNOEQ1PfE2ISH_yi_09QFtCmrWgaVa4d9HG3A0NniNKj8FvFD7xBaSajCuM6W7FS2/exec";

  // The automatic polling useEffect hook remains exactly the same as our last update:
  useEffect(() => {
    if (!placedOrderCoordinates || !placedOrderCoordinates.orderId) return;

    const checkStatusInterval = setInterval(async () => {
      try {
        const checkUrl = `${baseWebUrl}?action=checkOrderStatus&orderId=${placedOrderCoordinates.orderId}`;
        const response = await fetch(checkUrl);
        const data = await response.json();

        if (data && data.status && data.status.toLowerCase().includes("delivered")) {
          alert("Your Raya Foods order has arrived and been successfully delivered!");
          setPlacedOrderCoordinates(null); // Wipes it automatically across matching states
        }
      } catch (error) {
        console.error("Error monitoring live delivery status changes:", error);
      }
    }, 10000);

    return () => clearInterval(checkStatusInterval);
  }, [placedOrderCoordinates, setPlacedOrderCoordinates]);

  // ... rest of your getCleanPrice, handlePlaceOrder, and JSX components remain exactly identical!

  const getCleanPrice = (item) => {
    let rawPrice = item.price;
    if (typeof rawPrice === 'string') {
      rawPrice = rawPrice.replace(/[^\d]/g, ''); 
    }
    const parsedPrice = Number(rawPrice);
    
    if (isNaN(parsedPrice) || parsedPrice === 0) {
      const nameLower = (item.name || "").toLowerCase();
      if (nameLower.includes("poori") || nameLower.includes("puri")) return 40;
      if (nameLower.includes("dosa")) return 45;
      return 60; 
    }
    return parsedPrice;
  };

  const itemTotal = cart.reduce((sum, item) => {
    const price = getCleanPrice(item);
    return sum + (price * (item.quantity || 1));
  }, 0);

  const deliveryFee = cart.length > 0 ? 5 : 0;
  const toPay = itemTotal + deliveryFee;

  const handleSignUpClick = () => {
    navigate('/Sign In'); 
  };
  
  const handlePlaceOrder = () => {
    const customerName = user ? user.name : 'Guest';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;   
          const longitude = position.coords.longitude;  
          const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          const orderId = "RAYA-" + Date.now();
          
          const coordinatesObj = { 
            lat: latitude, 
            lng: longitude,
            orderId: orderId // Bound order tracking explicitly to this specific session block
          };
          
          sendOrderEmail(customerName, googleMapsUrl, coordinatesObj, orderId);
        },
        (error) => {
          console.error("Location access denied by user.", error);
          alert(`${customerName} must allow location and after buy your item`);
        }
      );
    } else {
      alert("Geolocation is not supported by this device browser.");
    }
  };

  const sendOrderEmail = (customerName, locationInfo, coordinatesObj, orderId) => {
    let orderDetailsText = "";
    cart.forEach((item) => {
      const currentPrice = getCleanPrice(item);
      const currentQuantity = item.quantity || 1;
      orderDetailsText += `${item.name} x ${currentQuantity} (₹${currentPrice * currentQuantity})\n`;
    });

    const adminEmail = "rakeshramcharan3@gmail.com";
    const memberEmail = "24jr1a05av@gmail.com";

    const takeOrderUrlAdmin = `${baseWebUrl}?orderId=${orderId}&driverEmail=${encodeURIComponent(adminEmail)}`;
    const takeOrderUrlMember1 = `${baseWebUrl}?orderId=${orderId}&driverEmail=${encodeURIComponent(memberEmail)}`;

    const templateParams = {
      order_id: orderId,
      customer_name: customerName,
      order_details: orderDetailsText,
      item_total: itemTotal,
      delivery_fee: deliveryFee,
      total_price: toPay,
      location_url: locationInfo
    };

    const SERVICE_ID = "service_29nizw2";
    const TEMPLATE_ID = "template_7zzckuz";
    const PUBLIC_KEY = "iRFZFTg7KH47GGIWb";

    const sendToAdmin = emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...templateParams, take_order_link: takeOrderUrlAdmin, to_email: adminEmail }, PUBLIC_KEY);
    const sendToMember1 = emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...templateParams, take_order_link: takeOrderUrlMember1, to_email: memberEmail }, PUBLIC_KEY);

    Promise.all([sendToAdmin, sendToMember1])
      .then((responses) => {
        console.log('SUCCESS! Notifications dispatched to all Raya Foods team members.', responses);
        alert(`Order placed successfully! Dispatched to nearby Raya Foods drivers.`);
        
        try {
          localStorage.setItem('active_order_coords', JSON.stringify(coordinatesObj));
        } catch (e) {
          console.error("Failed to save tracking coordinates to localStorage", e);
        }

        setPlacedOrderCoordinates(coordinatesObj);
        clearCart();
      })
      .catch((err) => {
        console.error('FAILED to broadcast dispatch alerts...', err);
        alert("Error sending order alerts. Please try again.");
      });
  };

  const handleTrackOrderRedirect = () => {
    if (placedOrderCoordinates) {
      navigate(
        `/track-order?lat=${placedOrderCoordinates.lat}&lng=${placedOrderCoordinates.lng}`,
        { state: { lat: placedOrderCoordinates.lat, lng: placedOrderCoordinates.lng } }
      );
    }
  };

  return (
    <div className="checkout-page-container">
      <div className="checkout-content-wrapper">
        
        {/* ================= LEFT SIDE LAYOUT ================= */}
        <div className="checkout-left-column">
          
          {/* Account Step */}
          <div className={`checkout-step-card ${!user ? 'active-step' : 'completed-step'}`}>
            <div className="step-icon-badge"><FaUser /></div>
            <div className="step-details">
              <h3>Account</h3>
              {user ? (
                <p style={{ color: '#2ea865', fontWeight: 'bold' }}>Logged in as {user.name} ✔</p>
              ) : (
                <>
                  <p>To place your order now, log in to your existing account or sign up.</p>
                  <button className="btn-primary-solid" onClick={handleSignUpClick}>SIGN UP</button>
                </>
              )}
            </div>
          </div>

          {/* Payment Step */}
          <div className={`checkout-step-card  ${user ? 'active-step' : 'disabled-step'}`}>
            <div className="step-icon-badge"><FaWallet /></div>
            <div className="step-details">
              <h3>Payment</h3>
              {user ? (
                <div className="payment-details-box">
                  <div className="cod-option">
                    <input type="radio" id="cod" name="payment-method" defaultChecked />
                    <label htmlFor="cod">
                      <strong>Cash on Delivery (COD)</strong>
                      <p>Pay with cash when your food arrives at your doorstep.</p>
                    </label>
                  </div>
                  
                  <button className="buy-now-btn" onClick={handlePlaceOrder} disabled={cart.length === 0}>
                     Buy Now
                  </button>

                  {/* Dynamic Track Order Button Layout Layer */}
                  {placedOrderCoordinates && (
                    <div className="track-action-container" style={{ marginTop: '15px' }}>
                      <button 
                        className="buy-now-btn" 
                        onClick={handleTrackOrderRedirect}
                        style={{ 
                          backgroundColor: '#0c6941', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '4px',
                          padding: '10px 15px',
                          height: 'auto'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaMapMarkerAlt /> Track Order Live
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 'normal' }}>
                          Location: {placedOrderCoordinates.lat.toFixed(4)}, {placedOrderCoordinates.lng.toFixed(4)}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="placeholder-text">Securely complete your profile step to select payment options.</p>
              )}
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDE LAYOUT ================= */}
        <div className="checkout-right-column">
          <div className="order-summary-card">
            <div className="summary-header">
              <h3>Raya Foods</h3>
              <p>Guntur</p>
            </div>

            <div className="summary-items-list">
              {cart.length === 0 ? (
                <p className="empty-cart-msg">Your order is active or processing tracking status.</p>
              ) : (
                cart.map((item) => {
                  const currentPrice = getCleanPrice(item);
                  const currentQuantity = item.quantity || 1;

                  return (
                    <div key={item.id || item.name} className="summary-food-row">
                      <span className="food-name">▪️ {item.name}</span>
                      
                      <div className="quantity-counter-box">
                        <button className="counter-btn" onClick={() => removeFromCart(item.id)}>
                          <FaMinus size={10} />
                        </button>
                        <span className="counter-value">{currentQuantity}</span>
                        <button className="counter-btn" onClick={() => addToCart(item)}>
                          <FaPlus size={10} />
                        </button>
                      </div>

                      <span className="food-row-price">₹{currentPrice * currentQuantity}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bill-breakdown-section">
              <h4>Bill Details</h4>
              <div className="bill-row">
                <span>Item Total</span>
                <span>₹{itemTotal}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
            </div>

            <div className="to-pay-banner-row">
              <div className="to-pay-label">
                <strong>TO PAY</strong>
              </div>
              <strong className="final-total-display">Total : ₹{toPay}</strong>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;