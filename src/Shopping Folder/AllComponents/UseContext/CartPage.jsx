import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext'; 
import { FaUser, FaWallet, FaPlus, FaMinus, FaMapMarkerAlt } from 'react-icons/fa';
import emailjs from '@emailjs/browser'; 
import './CartPage.css';
import './Livetracking.css';
import DriverStatusCard from './AdminDashboard/DriverStatusCard';

const CartPage = () => {
  const { cart, addToCart, removeFromCart, user, clearCart } = useCart();
  const navigate = useNavigate(); 

  const [activeOrders, setActiveOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('raya_active_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { 
      return [];
    }
  });

  const baseWebUrl = "https://script.google.com/macros/s/AKfycbxvFZnRm1pensNrFE_bjUFR_ADcGjQQn6lTIBwN512VDobr4bgXmQD36ei7kaEC0fcJ/exec";

  useEffect(() => {
    try {
      localStorage.setItem('raya_active_orders', JSON.stringify(activeOrders));
    } catch(e) {}
  }, [activeOrders]);

  const getCleanPrice = (item) => {
    let raw = item.price;
    if (typeof raw === 'string') raw = raw.replace(/[^\d]/g, '');
    const n = Number(raw);
    if (isNaN(n) || n === 0) {
      const name = (item.name || "").toLowerCase();
      if (name.includes("puri") || name.includes("poori")) return 40;
      if (name.includes("dosa")) return 45;
      return 60;
    }
    return n;
  };

  const itemTotal   = cart.reduce((sum, item) => sum + getCleanPrice(item) * (item.quantity || 1), 0);
  const deliveryFee = cart.length > 0 ? 5 : 0;
  const toPay       = itemTotal + deliveryFee;

  // ── AUTO-DETECT USER PHONE FROM ALL SIGN-IN / LOCALSTORAGE KEYS ──
  const getAutoUserPhone = () => {
    // 1. Direct Context check
    if (user) {
      const p = user.phone || user.phoneno || user.phoneNumber || user.phonenumber || user.mobile || user.contact || user.phone_number;
      if (p && p !== "Not Provided") return p;
    }

    // 2. LocalStorage user object check
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) {
        const p = stored.phone || stored.phoneno || stored.phoneNumber || stored.phonenumber || stored.mobile || stored.contact;
        if (p && p !== "Not Provided") return p;
      }
    } catch (e) {}

    // 3. Fallback to direct standalone localStorage keys
    const directPhone = localStorage.getItem('user_phone') || localStorage.getItem('raya_user_phone') || localStorage.getItem('phone');
    if (directPhone && directPhone !== "Not Provided") return directPhone;

    return "Not Provided";
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) { 
      alert("Your cart is empty!");
      return;
    }
    if (!user) { 
      alert("Please sign in first!"); 
      return; 
    }

    const autoPhone = getAutoUserPhone();

    navigator.geolocation.getCurrentPosition((pos) => {
        const lat     = pos.coords.latitude;
        const lng     = pos.coords.longitude;
        const mapUrl  = `https://www.google.com/maps?q=${lat},${lng}`;
        const orderId = "RAYA-" + Date.now();
        
        sendOrder(mapUrl, orderId, lat, lng, autoPhone);
      },
      () => alert("Please allow location access to place your order.")
    );
  };

  const sendOrder = async (mapUrl, orderId, lat, lng, autoPhone) => {
    let orderText = "";
    cart.forEach(item => {
      const p = getCleanPrice(item);
      const q = item.quantity || 1;
      orderText += `${item.name} x${q} = ₹${p * q}\n`;
    });

    const adminEmail  = "rakeshramcharan3@gmail.com";
    const memberEmail = "24r1a05av@gmail.com";

    const takeUrlAdmin  = `${baseWebUrl}?orderId=${orderId}&driverEmail=${encodeURIComponent(adminEmail)}`;
    const takeUrlMember = `${baseWebUrl}?orderId=${orderId}&driverEmail=${encodeURIComponent(memberEmail)}`;

    const customerName = user?.name || user?.displayName || user?.username || "Guest Customer";
    const userEmail    = user?.email || "Not Provided";

    const payload = {
      action: "createOrder",
      order_id: orderId,
      customer_name: customerName,
      customer_phone: autoPhone,
      user_email: userEmail,
      
      // Multi-alias matching for EmailJS template tags
      phone: autoPhone,
      phone_number: autoPhone,
      phoneno: autoPhone,

      order_details: orderText,
      item_total: itemTotal.toString(),
      delivery_fee: deliveryFee.toString(),
      total_price: toPay.toString(),
      location_url: mapUrl
    };

    // 1. Send Background Sync to Google Apps Script
    try {
      fetch(baseWebUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(e => console.log("GAS Sync Notice:", e));
    } catch(err) {
      console.log("GAS Sync skipped:", err);
    }

    // 2. Dispatch Emails via EmailJS
    const SID = "service_29nizw2";
    const TID = "template_7zzckuz";
    const KEY = "iRFZFTg7KH47GGIWb";

    Promise.all([
      emailjs.send(SID, TID, { ...payload, take_order_link: takeUrlAdmin, to_email: adminEmail }, KEY),
      emailjs.send(SID, TID, { ...payload, take_order_link: takeUrlMember, to_email: memberEmail }, KEY)
    ])
    .then(() => {
      alert("✅ Order placed! Notifying Raya Foods team...");

      const newOrder = {
        orderId,
        lat,
        lng,
        items: cart.map(item => ({
          name: item.name,
          qty:  item.quantity || 1,
          price: getCleanPrice(item)
        })),
        total: toPay,
        placedAt: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
        delivered: false
      };

      setActiveOrders(prev => [...prev, newOrder]);
      clearCart();
    })
    .catch(err => {
      console.error("EmailJS Error:", err);
      alert("❌ Failed to send order email. Please try again.");
    });
  };

  const handleOrderDelivered = (orderId) => {
    setActiveOrders(prev => prev.filter(o => o.orderId !== orderId));
  };

  const handleTrack = (order) => {
    navigate(`/track-order?lat=${order.lat}&lng=${order.lng}`,
      { state: { lat: order.lat, lng: order.lng } });
  };

  return (
    <div className="checkout-page-container">
      <div className="checkout-content-wrapper">

        {/* LEFT */}
        <div className="checkout-left-column">
          <div className={`checkout-step-card ${!user ? 'active-step' : 'completed-step'}`}>
            <div className="step-icon-badge"><FaUser /></div>
            <div className="step-details">
              <h3>Account</h3>
              {user
                ? <p style={{ color:'#2ea865', fontWeight:'bold' }}>Logged in as {user.name} ✔</p>
                : <>
                    <p>Please sign in to place your order.</p>
                    <button className="btn-primary-solid" onClick={() => navigate('/Sign In')}>SIGN IN</button>
                  </>
              }
            </div>
          </div>

          <div className={`checkout-step-card ${user ? 'active-step' : 'disabled-step'}`}>
            <div className="step-icon-badge"><FaWallet /></div>
            <div className="step-details">
              <h3>Payment</h3>
              {user ? (
                <div className="payment-details-box">
                  <div className="cod-option">
                    <input type="radio" id="cod" name="payment-method" defaultChecked />
                    <label htmlFor="cod">
                      <strong>Cash on Delivery (COD)</strong>
                      <p>Pay with cash when your food arrives.</p>
                    </label>
                  </div>

                  <button
                    className="buy-now-btn"
                    onClick={handlePlaceOrder}
                    disabled={cart.length === 0}
                  >
                    {cart.length === 0 ? 'Add items to cart first' : 'Buy Now'}
                  </button>

                </div>
              ) : (
                <p className="placeholder-text">Sign in to access payment options.</p>
              )}
            </div>
          </div>

          {activeOrders.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'10px', color:'#ffffff' }}>
                🛵 Your Active Orders ({activeOrders.length})
              </h3>

              {activeOrders.map((order, index) => (
                <div key={order.orderId} style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                    <div>
                      <span style={{ fontSize:'13px', fontWeight:'600', color:'#015d01' }}>
                        Order #{index + 1}
                      </span>
                      <span style={{ fontSize:'11px', color:'#aaa', marginLeft:'8px' }}>
                        Placed at {order.placedAt}
                      </span>
                    </div>
                    <span style={{ fontSize:'13px', fontWeight:'600' }}>₹{order.total}</span>
                  </div>

                  <div style={{ fontSize:'12px', color:'#666', marginBottom:'10px', lineHeight:'1.8' }}>
                    {order.items.map((item, i) => (
                      <span key={i}>
                        {item.name} x{item.qty} (₹{item.price * item.qty})
                        {i < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>

                  <DriverStatusCard orderId={order.orderId} />

                  <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                    <button
                      className="buy-now-btn"
                      onClick={() => handleTrack(order)}
                      style={{ flex:1, backgroundColor:'#0c6941', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px' }}
                    >
                      <FaMapMarkerAlt /> Track
                    </button>

                    <button
                      onClick={() => handleOrderDelivered(order.orderId)}
                      style={{ flex:1, background:'#f5f5f5', border:'1px solid #ddd', borderRadius:'8px', padding:'10px', fontSize:'13px', color:'#555', cursor:'pointer' }}
                    >
                      ✅ Mark Delivered
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="checkout-right-column">
          <div className="order-summary-card">
            <div className="summary-header">
              <h3>Raya Foods</h3>
              <p>Guntur</p>
            </div>

            <div className="summary-items-list">
              {cart.length === 0 ? (
                <p className="empty-cart-msg">Add items from the menu to order.</p>
              ) : (
                cart.map(item => {
                  const price = getCleanPrice(item);
                  const qty   = item.quantity || 1;
                  return (
                    <div key={item.id || item.name} className="summary-food-row">
                      <span className="food-name">▪️ {item.name}</span>
                      <div className="quantity-counter-box">
                        <button className="counter-btn" onClick={() => removeFromCart(item.id)}>
                          <FaMinus size={10} />
                        </button>
                        <span className="counter-value">{qty}</span>
                        <button className="counter-btn" onClick={() => addToCart(item)}>
                          <FaPlus size={10} />
                        </button>
                      </div>
                      <span className="food-row-price">₹{price * qty}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bill-breakdown-section">
              <h4>Bill Details</h4>
              <div className="bill-row"><span>Item Total</span><span>₹{itemTotal}</span></div>
              <div className="bill-row"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
            </div>

            <div className="to-pay-banner-row">
              <div className="to-pay-label"><strong>TO PAY</strong></div>
              <strong className="final-total-display">Total : ₹{toPay}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;