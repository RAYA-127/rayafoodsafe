import React, { useState } from 'react'; // Fixed: Imported useState from 'react'
import { useNavigate } from 'react-router-dom'; 
import { useCart } from './CartContext'; 
import { FaUser, FaWallet, FaPlus, FaMinus, FaMapMarkerAlt } from 'react-icons/fa';
import emailjs from '@emailjs/browser'; 
import './CartPage.css';
import './Livetracking.css';

const CartPage = () => {
  const { cart, addToCart, removeFromCart, user, clearCart } = useCart();
  const navigate = useNavigate(); 

  // Local state to store coordinates after a successful order placement, loaded from localStorage if present
  const [placedOrderCoordinates, setPlacedOrderCoordinates] = useState(() => {
    try {
      const saved = localStorage.getItem('placedOrderCoordinates');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load tracking coordinates from localStorage", e);
      return null;
    }
  });

  // Helper function to cleanly extract a numeric price from an item
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
          
          // Save coordinates locally so the Track Order button can access them later
          const coordinatesObj = { lat: latitude, lng: longitude };
          
          sendOrderEmail(customerName, googleMapsUrl, coordinatesObj);
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

  const sendOrderEmail = (customerName, locationInfo, coordinatesObj) => {
    let orderDetailsText = "";
    cart.forEach((item) => {
      const currentPrice = getCleanPrice(item);
      const currentQuantity = item.quantity || 1;
      orderDetailsText += `${item.name} x ${currentQuantity} (₹${currentPrice * currentQuantity})\n`;
    });

    const templateParams = {
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

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        console.log('SUCCESS! Order sent automatically.', response.status, response.text);
        alert(`Order placed successfully! Delivery details have been automatically dispatched to Raya Foods.`);
        
        // Lock in the coordinates to reveal the Track Order button and save to localStorage
        setPlacedOrderCoordinates(coordinatesObj);
        try {
          localStorage.setItem('placedOrderCoordinates', JSON.stringify(coordinatesObj));
        } catch (e) {
          console.error("Failed to save tracking coordinates to localStorage", e);
        }
        clearCart();
      })
      .catch((err) => {
        console.error('FAILED to send order automatically...', err);
        alert("Something went wrong dispatching your email. Please try again.");
      });
  };

  // Triggers navigation to your tracking route with exact URL parameter keys
  const handleTrackOrderRedirect = () => {
    if (placedOrderCoordinates) {
      window.open(`/track-order?lat=${placedOrderCoordinates.lat}&lng=${placedOrderCoordinates.lng}`, '_blank');
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
                  
                  {/* Buy Now Button disables once item is bought and cart clears */}
                  <button className="buy-now-btn" onClick={handlePlaceOrder}
                    disabled={cart.length === 0}>
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
                <p className="empty-cart-msg">Your cart is active or processing tracking status.</p>
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