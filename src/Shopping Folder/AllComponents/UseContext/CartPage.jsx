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

  // ── Multiple orders stored as array — persists in localStorage ──
  const [activeOrders, setActiveOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('raya_active_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const baseWebUrl = "https://script.google.com/macros/s/AKfycbzuNOEQ1PfE2ISH_yi_09QFtCmrWgaVa4d9HG3A0NniNKj8FvFD7xBaSajCuM6W7FS2/exec";

  // Save orders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('raya_active_orders', JSON.stringify(activeOrders));
    } catch(e) {}
  }, [activeOrders]);

  // ── Price helper ─────────────────────────────────────────────
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

  // ── Place Order ──────────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (cart.length === 0) { alert("Your cart is empty!"); return; }
    if (!user)             { alert("Please sign in first!"); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat     = pos.coords.latitude;
        const lng     = pos.coords.longitude;
        const mapUrl  = `https://www.google.com/maps?q=${lat},${lng}`;
        const orderId = "RAYA-" + Date.now();
        sendEmail(user.name, mapUrl, orderId, lat, lng);
      },
      () => alert("Please allow location access to place your order.")
    );
  };

  const sendEmail = (customerName, mapUrl, orderId, lat, lng) => {
    // Build order summary text for this order
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

    const params = {
      order_id:      orderId,
      customer_name: customerName,
      order_details: orderText,
      item_total:    itemTotal,
      delivery_fee:  deliveryFee,
      total_price:   toPay,
      location_url:  mapUrl
    };

    const SID = "service_29nizw2";
    const TID = "template_7zzckuz";
    const KEY = "iRFZFTg7KH47GGIWb";

    Promise.all([
      emailjs.send(SID, TID, { ...params, take_order_link: takeUrlAdmin,  to_email: adminEmail  }, KEY),
      emailjs.send(SID, TID, { ...params, take_order_link: takeUrlMember, to_email: memberEmail }, KEY)
    ])
    .then(() => {
      alert("✅ Order placed! Notifying Raya Foods team...");

      // Add this new order to the list — previous orders stay!
      const newOrder = {
        orderId,
        lat,
        lng,
        items: cart.map(item => ({
          name: item.name,
          qty:  item.quantity || 1,
          price: getCleanPrice(item)
        })),
        total:     toPay,
        placedAt:  new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
        delivered: false
      };

      setActiveOrders(prev => [...prev, newOrder]);
      clearCart(); // Clear cart for next order
    })
    .catch(err => {
      console.error(err);
      alert("❌ Failed to send order. Please try again.");
    });
  };

  // ── Remove order when delivered ──────────────────────────────
  const handleOrderDelivered = (orderId) => {
    setActiveOrders(prev => prev.filter(o => o.orderId !== orderId));
  };

  // ── Track order ──────────────────────────────────────────────
  const handleTrack = (order) => {
    navigate(`/track-order?lat=${order.lat}&lng=${order.lng}`,
      { state: { lat: order.lat, lng: order.lng } });
  };

  return (
    <div className="checkout-page-container">
      <div className="checkout-content-wrapper">

        {/* ── LEFT ── */}
        <div className="checkout-left-column">

          {/* Account */}
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

          {/* Payment */}
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

                  {/* Buy Now — always available for new orders */}
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

          {/* ── ALL ACTIVE ORDERS — each stays until delivered ── */}
          {activeOrders.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'10px', color:'#ffffffff' }}>
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
                  {/* Order header */}
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

                  {/* Items summary */}
                  <div style={{ fontSize:'12px', color:'#666', marginBottom:'10px', lineHeight:'1.8' }}>
                    {order.items.map((item, i) => (
                      <span key={i}>
                        {item.name} x{item.qty} (₹{item.price * item.qty})
                        {i < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Driver card — shows spinner until teammate accepts */}
                  <DriverStatusCard orderId={order.orderId} />

                  {/* Track + Delivered buttons */}
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

        {/* ── RIGHT — Cart summary ── */}
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
