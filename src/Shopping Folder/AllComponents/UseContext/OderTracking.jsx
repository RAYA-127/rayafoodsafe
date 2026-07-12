import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import './Livetracking.css';

// How many extra points to insert between each pair of route points.
// Higher = smoother glide, but more setInterval ticks.
const SMOOTHING_POINTS_PER_SEGMENT = 12;
const TICK_MS = 120; // animation frame rate
const ASSUMED_SPEED_KMH = 22; // used only for the straight-line fallback ETA

// The milestones shown in the progress tracker (Zomato/Swiggy style)
const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'pickedup', label: 'Picked Up' },
  { key: 'onway', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

const OrderTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Prefer state passed via navigate() (same-tab flow); fall back to the URL
  // query string and finally to sessionStorage so a page refresh doesn't lose the order.
  const queryParams = new URLSearchParams(location.search);
  const stateLat = location.state?.lat;
  const stateLng = location.state?.lng;
  const queryLat = parseFloat(queryParams.get('lat'));
  const queryLng = parseFloat(queryParams.get('lng'));

  let storedLat, storedLng;
  try {
    const cached = JSON.parse(sessionStorage.getItem('lastOrderCoords') || 'null');
    if (cached) {
      storedLat = cached.lat;
      storedLng = cached.lng;
    }
  } catch (e) {
    /* ignore malformed cache */
  }

  const userLat = stateLat ?? (Number.isFinite(queryLat) ? queryLat : storedLat);
  const userLng = stateLng ?? (Number.isFinite(queryLng) ? queryLng : storedLng);

  // App UI State
  const [statusText, setStatusText] = useState('Confirming your order...');
  const [timeRemaining, setTimeRemaining] = useState(null); // minutes
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [fatalError, setFatalError] = useState(null); // blocks the whole page (no map at all)
  const [routeNotice, setRouteNotice] = useState(null); // small non-blocking banner

  // DOM element references
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const animationTimerRef = useRef(null);

  // Hardcoded Restaurant Location (Raya Foods, Guntur)
  const RESTAURANT_LOCATION = { lat: 16.3067, lng: 80.4365 };
  const hasValidUserLocation = Number.isFinite(userLat) && Number.isFinite(userLng);
  const USER_LOCATION = hasValidUserLocation
    ? { lat: userLat, lng: userLng }
    : { lat: 16.3067, lng: 80.4365 };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  // Persist whatever we resolved so a refresh keeps tracking the same order
  useEffect(() => {
    if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
      sessionStorage.setItem('lastOrderCoords', JSON.stringify({ lat: userLat, lng: userLng }));
    }
  }, [userLat, userLng]);

  useEffect(() => {
    if (!hasValidUserLocation) {
      setFatalError("We couldn't find your delivery location. Please place the order again with location access enabled.");
      return;
    }

    let cancelled = false;

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCEqBHPzL6upkUWfUyp1ZFKyYNYGSqtPnk&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => !cancelled && initLiveTrackingMap();
      script.onerror = () => !cancelled && setFatalError('Failed to load Google Maps. Check your internet connection.');
      document.head.appendChild(script);
    } else {
      initLiveTrackingMap();
    }

    function initLiveTrackingMap() {
      const google = window.google;

      googleMapInstance.current = new google.maps.Map(mapRef.current, {
        center: RESTAURANT_LOCATION,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
      });

      new google.maps.Marker({
        position: RESTAURANT_LOCATION,
        map: googleMapInstance.current,
        title: 'Raya Foods',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png',
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      new google.maps.Marker({
        position: USER_LOCATION,
        map: googleMapInstance.current,
        title: 'Your Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(35, 35),
        },
      });

      // Delivery partner marker: a rotating arrow symbol so it visibly points
      // the direction it's driving, just like the bike icon in Zomato/Swiggy.
      deliveryMarkerRef.current = new google.maps.Marker({
        position: RESTAURANT_LOCATION,
        map: googleMapInstance.current,
        title: 'Delivery Partner',
        zIndex: 999,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#0c6941',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 0,
        },
      });

      // Fit both pins in view immediately so the user sees restaurant + home
      // even before any route/animation kicks in.
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(RESTAURANT_LOCATION);
      bounds.extend(USER_LOCATION);
      googleMapInstance.current.fitBounds(bounds, 80);

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: googleMapInstance.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#0c6941',
          strokeOpacity: 0.8,
          strokeWeight: 6,
        },
      });

      directionsService.route(
        {
          origin: RESTAURANT_LOCATION,
          destination: USER_LOCATION,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (cancelled) return;

          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);

            const leg = result.routes[0].legs[0];
            const etaMinutes = Math.max(1, Math.round(leg.duration.value / 60));

            const rawPath = result.routes[0].overview_path;
            const densePath = buildSmoothPath(google, rawPath, SMOOTHING_POINTS_PER_SEGMENT);

            beginJourney(google, densePath, etaMinutes);
          } else {
            // Directions API failed (commonly: not enabled, billing not set
            // up, or key restrictions). Log the real reason for debugging,
            // and fall back to a straight-line path so tracking still works.
            console.error('Directions API failed with status:', status);
            setRouteNotice(explainDirectionsError(status));

            // Draw a plain straight line between the two points instead.
            new google.maps.Polyline({
              path: [RESTAURANT_LOCATION, USER_LOCATION],
              geodesic: true,
              strokeColor: '#0c6941',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '15px' }],
              map: googleMapInstance.current,
            });

            const distanceMeters = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(RESTAURANT_LOCATION),
              new google.maps.LatLng(USER_LOCATION)
            );
            const etaMinutes = Math.max(1, Math.round((distanceMeters / 1000 / ASSUMED_SPEED_KMH) * 60));

            const straightPath = buildSmoothPath(
              google,
              [
                new google.maps.LatLng(RESTAURANT_LOCATION),
                new google.maps.LatLng(USER_LOCATION),
              ],
              SMOOTHING_POINTS_PER_SEGMENT * 6 // more points since it's a single segment
            );

            beginJourney(google, straightPath, etaMinutes);
          }
        }
      );
    }

    function beginJourney(google, path, etaMinutes) {
      setTimeRemaining(etaMinutes);
      setActiveStepIndex(1); // Preparing
      setStatusText('Preparing your order...');

      animationTimerRef.current = setTimeout(() => {
        if (!cancelled) animateDeliveryPartner(google, path, etaMinutes);
      }, 3000);
    }

    function animateDeliveryPartner(google, pathCoordinates, etaMinutes) {
      let currentStep = 0;
      const totalSteps = pathCoordinates.length;

      setActiveStepIndex(2); // Picked up
      setStatusText('Delivery partner has picked up your order!');

      const movementInterval = setInterval(() => {
        if (currentStep >= totalSteps - 1) {
          clearInterval(movementInterval);
          setActiveStepIndex(4);
          setStatusText('Order Delivered! Enjoy your meal from Raya Foods.');
          setTimeRemaining(0);
          return;
        }

        const current = pathCoordinates[currentStep];
        const next = pathCoordinates[currentStep + 1];

        // Point the arrow marker in the direction of travel
        const heading = google.maps.geometry.spherical.computeHeading(current, next);
        const icon = deliveryMarkerRef.current.getIcon();
        deliveryMarkerRef.current.setIcon({ ...icon, rotation: heading });
        deliveryMarkerRef.current.setPosition(next);
        googleMapInstance.current.panTo(next);

        const completionPercentage = currentStep / totalSteps;
        const newTimeRemaining = Math.max(1, Math.round(etaMinutes * (1 - completionPercentage)));
        setTimeRemaining(newTimeRemaining);

        if (completionPercentage > 0.15 && completionPercentage < 0.85) {
          setActiveStepIndex(3); // On the way
          setStatusText('Driver is on the way to you...');
        } else if (completionPercentage >= 0.85) {
          setStatusText('Driver is nearby your neighborhood...');
        }

        currentStep++;
      }, TICK_MS);
    }

    return () => {
      cancelled = true;
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLng]);

  return (
    <div className="tracking-page-overlay-wrapper">
      <div className="live-tracking-screen">
        <div className="tracking-header-green">
          <div className="back-nav-row" onClick={handleBackToCart} style={{ cursor: 'pointer' }}>
            <FaArrowLeft /> <span>Back to Cart</span>
          </div>
          <h2 style={{ letterSpacing: '1px', marginTop: '10px' }}>Raya Foods</h2>
          <h1 className="live-status-alert">{statusText}</h1>

          <div className="arrival-badge">
            {timeRemaining === null ? (
              <span>Calculating ETA...</span>
            ) : timeRemaining > 0 ? (
              <>Arriving in <strong style={{ fontSize: '1.1rem' }}>{timeRemaining} min{timeRemaining !== 1 ? 's' : ''}</strong> • <span className="ontime-txt">On time</span></>
            ) : (
              <strong style={{ color: '#fff' }}>Delivered Successfully ✔</strong>
            )}
          </div>

          {/* Zomato-style progress tracker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', padding: '0 4px' }}>
            {STEPS.map((step, idx) => {
              const done = idx <= activeStepIndex;
              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <FaCheckCircle size={16} color={done ? '#ffffff' : 'rgba(255,255,255,0.35)'} />
                  <span style={{
                    fontSize: '0.65rem',
                    marginTop: '4px',
                    color: done ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    textAlign: 'center',
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {routeNotice && (
          <div style={{
            background: '#fff8e1',
            color: '#7a5b00',
            fontSize: '0.8rem',
            padding: '8px 16px',
            borderBottom: '1px solid #f0e0a0',
          }}>
            {routeNotice}
          </div>
        )}

        {fatalError ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#555' }}>{fatalError}</div>
        ) : (
          <div
            ref={mapRef}
            className="map-canvas-container"
            style={{ height: routeNotice ? 'calc(100vh - 260px)' : 'calc(100vh - 220px)', width: '100%', minHeight: '400px' }}
          />
        )}
      </div>
    </div>
  );
};

// Interpolates extra points between each pair of consecutive points on a path
// so the marker glides smoothly instead of jumping between sparse points.
function buildSmoothPath(google, points, pointsPerSegment) {
  const smooth = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    for (let step = 0; step < pointsPerSegment; step++) {
      const fraction = step / pointsPerSegment;
      smooth.push(google.maps.geometry.spherical.interpolate(start, end, fraction));
    }
  }
  smooth.push(points[points.length - 1]);
  return smooth;
}

// Turns a Directions API status code into a human-readable, actionable note.
function explainDirectionsError(status) {
  switch (status) {
    case 'REQUEST_DENIED':
      return 'Showing an approximate straight-line route — road directions are disabled (check that "Directions API" is enabled and billing is active on your Google Cloud project).';
    case 'OVER_QUERY_LIMIT':
      return 'Showing an approximate straight-line route — the Directions API quota/billing limit was hit.';
    case 'ZERO_RESULTS':
      return 'Showing an approximate straight-line route — no drivable road route was found between these two points.';
    case 'INVALID_REQUEST':
      return 'Showing an approximate straight-line route — the request to Directions API was invalid.';
    default:
      return `Showing an approximate straight-line route — road directions failed (${status}).`;
  }
}

export default OrderTracking;
