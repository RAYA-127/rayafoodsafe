import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaHome, FaPhone } from 'react-icons/fa';
import { useCart } from '../AllComponents/UseContext/CartContext'; // Adjust path if needed

const SigninPage = () => {
  const { handleUserDeviceLogin, login, user } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 🛡️ Route Guard: Kick logged-in users away from the sign-in screen
  useEffect(() => {
    if (user) {
      navigate('/Home'); 
    }
  }, [user, navigate]);

  // Controlled form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneno: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if (formData.name && formData.email && formData.password && formData.phoneno) {
      setIsLoading(true);
      try {
        // 1. Force phone number into localStorage IMMEDIATELY before async calls
        localStorage.setItem('user_phone', formData.phoneno.trim());
        localStorage.setItem('raya_user_phone', formData.phoneno.trim());

        // 2. Fetch cloud profile
        const cloudProfile = await handleUserDeviceLogin(formData.email);
        
        // 3. FORCE merge the phone number into the user profile object
        const fullProfile = {
          ...(cloudProfile || {}),
          name: formData.name,
          email: formData.email,
          phoneno: formData.phoneno.trim(),
          phone: formData.phoneno.trim(),
          phoneNumber: formData.phoneno.trim()
        };

        // Save updated complete user profile back to LocalStorage
        localStorage.setItem('user', JSON.stringify(fullProfile));
        
        // Login to React Context
        login(fullProfile); 

        // 4. SYNC PHONE TO GOOGLE APPS SCRIPT CLOUD STORAGE
        try {
          fetch("https://script.google.com/macros/s/AKfycbxvFZnRm1pensNrFE_bjUFR_ADcGjQQn6lTIBwN512VDobr4bgXmQD36ei7kaEC0fcJ/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              action: "syncUser",
              email: formData.email,
              profile: fullProfile
            })
          });
        } catch(syncErr) {
          console.log("Cloud sync notice:", syncErr);
        }

        alert(`Welcome back, ${formData.name}! Your account and phone details are synced.`);
        navigate('/Home');
      } catch (error) {
        console.error("Login process error:", error);
        alert("An error occurred during sign-in. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please fill in all your details!");
    }
  };

  return (
    <>
      <div className='home-link-container'>
        <Link to="/Home">
          <div className='home-div'>
            <FaHome size={30} />
            <button className='back-btn'><span className='home-span'>Home</span></button>
            <span className='home-icon'> </span>
          </div>
        </Link>
      </div>

      <div className='full-signin-page'>
        <div className="blurred-bg-layer"></div> 

        <div className="form">
          <form onSubmit={handleSubmit}> 
            <div className="title">
              <h1>Sign In</h1>
            </div>

            {/* Name Input */}
            <div className="name">
              <label>Name : </label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input 
                  type="text"
                  name='name'
                  placeholder='Username'
                  value={formData.name} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="email">
              <label>Email : </label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input 
                  type="email" 
                  placeholder='Email'
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="phone">
              <label>Phone Number : </label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input 
                  type="tel" 
                  placeholder='Phone Number'
                  name="phoneno"
                  value={formData.phoneno} 
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Please enter a valid 10-digit phone number"
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="password">
              <label>Password : </label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type="password"
                  name="password"
                  placeholder='Password'
                  required
                  value={formData.password} 
                  onChange={handleChange}
                />
              </div>
            </div>
  
            <div className='submit'>
              <button type='submit' disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SigninPage;