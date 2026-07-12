import React from 'react';

export const Offers = () => {
  const deals = [
    { id: 1, title: '50% OFF on first order', desc: 'Use code RAYA50 to get instant discount', code: 'RAYA50', valid: 'Valid on orders above ₹150' },
    { id: 2, title: 'Free Delivery Weekend', desc: 'Get free shipping on all breakfasts items', code: 'FREEDEL', valid: 'Valid till Sunday' },
    { id: 3, title: 'Dosa Mania Offer', desc: 'Buy any 2 Dosas and get 1 Plain Dosa free', code: 'DOSALOVE', valid: 'Limited time promo' }
  ];

  return (
    <div className="offers-container">
      <h2 className="page-heading">Exclusive Food Offers</h2>
      <div className="offers-grid">
        {deals.map(deal => (
          <div key={deal.id} className="offer-card">
            <div className="offer-badge">DISCOUNT</div>
            <h3>{deal.title}</h3>
            <p>{deal.desc}</p>
            <div className="coupon-code">
              <code>{deal.code}</code>
            </div>
            <small>{deal.valid}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

