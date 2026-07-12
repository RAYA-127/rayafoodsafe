import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Livetracking.css';

const OrderTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse user's real coordinate parameters from the URL
  const queryParams = new URLSearchParams(location.search);
  const userLat = parseFloat(queryParams.get('lat'));
  const userLng = parseFloat(queryParams.get('lng'));

  // App UI State
  const [statusText, setStatusText] = useState("Preparing your order...");
  const [timeRemaining, setTimeRemaining] = useState(40); // Starts at 40 mins

  // DOM element references
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const deliveryMarkerRef = useRef(null);
  
  // Hardcoded Restaurant Location (Raya Foods, Guntur)
  const RESTAURANT_LOCATION = { lat: 16.3067, lng: 80.4365 };
  // Fallback to restaurant location if user coords fail to load
  const USER_LOCATION = { lat: userLat || 16.3067, lng: userLng || 80.4365 };

  // 1. Handle Navigation Back to Cart
  const handleBackToCart = () => {
    navigate('/cart');
  };

  useEffect(() => {
    // If Google Maps script isn't global yet, attach it safely
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCEqBHPzL6upkUWfUyp1ZFKyYNYGSqtPnk&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => initLiveTrackingMap();
      document.head.appendChild(script);
    } else {
      initLiveTrackingMap();
    }

    function initLiveTrackingMap() {
      const google = window.google;

      // Initialize the map center point
      googleMapInstance.current = new google.maps.Map(mapRef.current, {
        center: RESTAURANT_LOCATION,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Add Restaurant Pin
      new google.maps.Marker({
        position: RESTAURANT_LOCATION,
        map: googleMapInstance.current,
        title: "Raya Foods",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/restaurant.png",
          scaledSize: new google.maps.Size(40, 40)
        }
      });

      // Add Customer Pin
      new google.maps.Marker({
        position: USER_LOCATION,
        map: googleMapInstance.current,
        title: "Your Location",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new google.maps.Size(35, 35)
        }
      });

      // Initialize dynamic delivery partner car marker at the restaurant starting point
      deliveryMarkerRef.current = new google.maps.Marker({
        position: RESTAURANT_LOCATION,
        map: googleMapInstance.current,
        title: "Delivery Partner",
        icon: {
          url: "https://cdn-icons-png.flaticon.com/512/754/754854.png", // Delivery Scooter / Car Icon
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 20)
        }
      });

      // Set up Directions Renderer to paint the road path layout
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: googleMapInstance.current,
        suppressMarkers: true, // Keep our custom restaurant/user markers clean
        polylineOptions: {
          strokeColor: "#0c6941", // Raya Foods brand green
          strokeOpacity: 0.8,
          strokeWeight: 6
        }
      });

      // Request actual road routing map from Google
      directionsService.route(
        {
          origin: RESTAURANT_LOCATION,
          destination: USER_LOCATION,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            
            // Extract the list of breakdown coordinates making up the road path
            const routePath = result.routes[0].overview_path;
            
            // Trigger animation routine across the street network path after 4 seconds of "preparation"
            setTimeout(() => {
              animateDeliveryPartner(routePath);
            }, 4000);
          } else {
            console.error("Directions lookup failed due to: " + status);
          }
        }
      );
    }

    // Swiggy-style movement animation tracking logic
    function animateDeliveryPartner(pathCoordinates) {
      let currentStep = 0;
      const totalSteps = pathCoordinates.length;
      
      setStatusText("Delivery partner has picked up your order! Heading your way.");

      const movementInterval = setInterval(() => {
        if (currentStep >= totalSteps) {
          clearInterval(movementInterval);
          setStatusText("Order Delivered! Enjoy your meal from Raya Foods.");
          setTimeRemaining(0);
          return;
        }

        // Update active location coordinate coordinates on the map instance
        const nextPosition = pathCoordinates[currentStep];
        deliveryMarkerRef.current.setPosition(nextPosition);
        
        // Dynamically adjust map focus viewport slightly behind the driver's progress loop
        googleMapInstance.current.panTo(nextPosition);

        // Dynamically reduce delivery tracking ETA countdown time smoothly
        const completionPercentage = currentStep / totalSteps;
        const newTimeRemaining = Math.max(2, Math.floor(30 - (completionPercentage * 30)));
        setTimeRemaining(newTimeRemaining);

        // Update middle status phases based on route progress loops
        if (currentStep > totalSteps * 0.5 && currentStep < totalSteps * 0.9) {
          setStatusText("Driver is nearby your neighborhood...");
        }

        currentStep++;
      }, 800); // Ticks movement changes every 800 milliseconds
    }
  }, [userLat, userLng]);

  return (
    <div className="tracking-page-overlay-wrapper">
      <div className="live-tracking-screen">
        
        {/* Swiggy/Zomato style top notification control deck panel */}
        <div className="tracking-header-green">
          <div className="back-nav-row" onClick={handleBackToCart} style={{ cursor: 'pointer' }}>
            <FaArrowLeft /> <span>Back to Cart</span>
          </div>
          <h2 style={{ letterSpacing: '1px', marginTop: '10px' }}>Raya Foods</h2>
          <h1 className="live-status-alert">{statusText}</h1>
          
          <div className="arrival-badge">
            {timeRemaining > 0 ? (
              <>Arriving in <strong style={{fontSize: '1.1rem'}}>{timeRemaining} mins</strong> • <span className="ontime-txt">On time</span></>
            ) : (
              <strong style={{color: '#fff'}}>Delivered Successfully ✔</strong>
            )}
          </div>
        </div>

        {/* Live Active Map Workspace */}
        <div 
          ref={mapRef} 
          className="map-canvas-container" 
          style={{ height: 'calc(100vh - 160px)', width: '100%', minHeight: '500px' }}
        />

      </div>
    </div>
  );
};

export default OrderTracking;