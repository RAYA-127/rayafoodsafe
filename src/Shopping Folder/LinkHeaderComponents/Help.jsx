import React from 'react';

export const Help = () => {
  const faqs = [
    { 
      q: "How long does breakfast delivery take?", 
      a: "Standard breakfast deliveries usually arrive within 15 to 20 minutes to keep your items hot."

     },
    { 
      q: "Can I cancel my food order?",
      a: "Orders can be canceled from your profile screen within 5 minutes of placing them."

     },
    { 
      q: "What payment methods do you accept?",
      a: "We support all major UPI transactions (GPay, PhonePe), Cards, and Cash on Delivery." 

    }
  ];

  return (
    <div className="help-container">
      <h2 className="page-heading">How can we help you?</h2>
      
      <div className="faq-section">
        <h3>Frequently Asked Questions</h3>
        {faqs.map((faq, i) => (
          <div key={i} className="faq-box">
            <h4>{faq.q}</h4>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="contact-support">
        <h3>Still have questions?</h3>
        <p>Email us at: <strong>rakeshramcharan3@gmail.com</strong></p>
        <p>Call toll free: <strong>+91 9063668256</strong></p>
      </div>
    </div>
  );
};

