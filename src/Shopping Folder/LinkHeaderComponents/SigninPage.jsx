import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaHome } from 'react-icons/fa';
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
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page reload
    
    if (formData.name && formData.email && formData.password) {
      setIsLoading(true);
      try {
        // 1. Fetch persistent cross-device data (Cart history & Active tracks)
        const cloudProfile = await handleUserDeviceLogin(formData.email);
        
        if (cloudProfile) {
          // Existing user with saved history found! Context automatically restores everything.
          alert(`Welcome back to Raya Foods, ${cloudProfile.name || formData.name}! Your session and cart items have been completely restored.`);
        } else {
          // If they are an entirely new profile or had no previous database cloud record
          const newLocalUserData = { 
            name: formData.name, 
            email: formData.email 
          };
          login(newLocalUserData); 
          alert("Account initialized on new profile container!");
        }
        
        // 2. Send them to the homepage instantly
        navigate('/Home');
      } catch (error) {
        console.error("Login process error:", error);
        alert("An error occurred during sign-in. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please fill in your details!");
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