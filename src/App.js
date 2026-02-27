import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Loader2, Shirt, MapPin } from 'lucide-react';
import './App.css';

// In development: always use /api/rsvp so the dev server proxy forwards to Google (works for localhost AND phone via laptop IP).
// In production: use direct Google Apps Script URL (app is typically on same domain or CORS is handled).
const DIRECT_GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';
function getSubmitUrl() {
  if (process.env.NODE_ENV === 'development') return '/api/rsvp';
  return DIRECT_GOOGLE_SCRIPT_URL;
}
// Optional: PDF file URL (e.g. invitation or schedule) and map/location URL
const PDF_URL = process.env.REACT_APP_PDF_URL || '#';
const LOCATION_URL = process.env.REACT_APP_LOCATION_URL || 'https://maps.google.com';

export default function RSVPPortal() {
  const [showRSVP, setShowRSVP] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    attending: '',
    arrivalDate: '',
    arrivalTime: '',
    transportation: ''
  });
  const [scrollY, setScrollY] = useState(0);

  // Left panel background (public/bg-from-pdf.png), right panel (public/inner.JPG), overlay (public/outer.JPG)
  const leftPanelBg = `${process.env.PUBLIC_URL || ''}/bg-from-pdf.png`;
  const rightPanelImage = `${process.env.PUBLIC_URL || ''}/inner.JPG`;
  const overlayImage = `${process.env.PUBLIC_URL || ''}/outer.JPG`;

  // On load/reload: show overlay (curtain) by scrolling to top
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      setScrollY(0);
    };
    scrollToTop();
    requestAnimationFrame(scrollToTop);
    const t = setTimeout(scrollToTop, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    // Lock once the overlay has fully scrolled away
    const threshold = window.innerHeight;
    if (currentScrollY >= threshold) {
      // Snap to exactly the threshold so there's no bounce/overscroll
      window.scrollTo(0, threshold);
      // Lock scrolling permanently (until refresh)
      document.body.style.overflow = 'hidden';
      window.removeEventListener('scroll', handleScroll);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  useEffect(() => {
  return () => {
    document.body.style.overflow = '';
  };
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. Validation Logic
  if (!formData.name || !formData.attending) {
    setSubmitMessage({
      type: 'error',
      text: 'Please fill in all required fields.'
    });
    return;
  }

  if (formData.attending === 'yes') {
    if (!formData.arrivalDate || !formData.arrivalTime || !formData.transportation) {
      setSubmitMessage({
        type: 'error',
        text: 'Please fill in all required fields for your arrival details.'
      });
      return;
    }
  }
  
  // 2. Environment Variable Check
  const submitUrl = process.env.REACT_APP_GOOGLE_SCRIPT_URL;
  if (!submitUrl) {
    setSubmitMessage({
      type: 'error',
      text: 'Integration not configured. Check Railway Variables.'
    });
    return;
  }

  setIsSubmitting(true);
  setSubmitMessage({ type: '', text: '' });

  try {
    // 3. The Fetch Request
    // We use 'no-cors' which prevents the browser from blocking the request 
    // due to missing headers from Google.
    await fetch(submitUrl, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(formData).toString(),
    });

    // 4. Handle "Silent Success"
    // Since 'no-cors' doesn't allow us to read the response, 
    // we jump straight to the success UI.
    const successText = formData.attending === 'no' 
      ? 'Thanks for your blessing!' 
      : 'RSVP submitted successfully! Thank you for your response.';

    setSubmitMessage({ type: 'success', text: successText });

    // 5. Form Reset and UI Cleanup
    setTimeout(() => {
      setFormData({ 
        name: '', 
        attending: '', 
        arrivalDate: '', 
        arrivalTime: '', 
        transportation: '' 
      });
      setShowRSVP(false);
      setSubmitMessage({ type: '', text: '' });
    }, 2500);

  } catch (error) {
    // 6. Actual Error Handling
    // This only runs if the request fails to leave the browser (e.g., no internet).
    console.error('Submission error:', error);
    setSubmitMessage({ 
      type: 'error', 
      text: 'Network error. Please check your connection and try again.' 
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="scroll-reveal-root">
      {/* Curtain: outer image scrolls up and fades to reveal the static page underneath */}
      <div
        className="scroll-reveal-overlay"
        style={{
          backgroundImage: `url(${overlayImage})`,
          transform: `translateY(${-scrollY}px)`,
          opacity: Math.max(0, 1 - scrollY / (typeof window !== 'undefined' ? window.innerHeight : 800)),
          pointerEvents: scrollY < (typeof window !== 'undefined' ? window.innerHeight : 800) - 20 ? 'auto' : 'none',
        }}
      >
        <p className="scroll-reveal-overlay-hint">Scroll up to join us...</p>
      </div>

      {/* Main RSVP page - fixed in place, revealed as curtain scrolls up */}
      <div className="container">
        {/* Shimmer overlay */}
        <div className="shimmer-overlay"></div>

        {/* Left Panel - 30% (background: public/bg-from-pdf.png) */}
      <div
        className="left-panel"
        style={{ backgroundImage: `url(${leftPanelBg})` }}
      >
        <div className="title-section">
          <h1 className="title">You're Invited</h1>
          <p className="subtitle">Join us for a special celebration</p>
        </div>

        <button onClick={() => setShowRSVP(true)} className="btn btn-primary">
          RSVP Now
        </button>

        <div className="action-buttons">
          <button onClick={() => setShowFAQ(true)} className="btn btn-icon btn-secondary" title="FAQ">
            <HelpCircle size={22} />
          </button>
          <a href={LOCATION_URL} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-secondary" title="Location">
            <MapPin size={22} />
          </a>
        </div>
      </div>

      {/* Right Panel - 70%: single image covering the whole panel */}
      <div
        className="right-panel right-panel-cover"
        style={{
          backgroundImage: `url(${rightPanelImage})`,
        }}
      />

      {/* RSVP Modal */}
      {showRSVP && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">RSVP</h2>
              <button onClick={() => setShowRSVP(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Are you coming?</label>
                <select
                  name="attending"
                  value={formData.attending}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Please select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {formData.attending === 'yes' && (
                <>
                  <div className="form-group">
                    <label className="form-label">When are you coming?</label>
                    <select
                      name="arrivalDate"
                      value={formData.arrivalDate}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select date...</option>
                      <option value="12th March">12th March</option>
                      <option value="13th March">13th March</option>
                      <option value="14th March">14th March</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">What time?</label>
                    <input
                      type="time"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">How are you coming?</label>
                    <select
                      name="transportation"
                      value={formData.transportation}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select transportation...</option>
                      <option value="by train">By Train</option>
                      <option value="by road">By Road</option>
                      <option value="by air">By Air</option>
                    </select>
                  </div>
                </>
              )}

              {submitMessage.text && (
                <div className={`submit-message ${submitMessage.type}`}>
                  {submitMessage.text}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{width: '100%'}}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="spinning" />
                    Submitting...
                  </>
                ) : (
                  'Submit RSVP'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="modal-overlay">
          <div className="modal-content modal-wide">
            <div className="modal-header">
              <h2 className="modal-title">Frequently Asked Questions</h2>
              <button onClick={() => setShowFAQ(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="faq-container">
              <div className="faq-item">
                <h3 className="faq-question">When should I arrive in Hyderabad?</h3>
                <p className="faq-answer">Please plan to arrive on or after March 12th, 2026.
Our celebrations begin with a lunchtime event on March 12th, so we recommend booking your travel soon.</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Where will we be staying? Do we need to book rooms?</h3>
                <p className="faq-answer">Your stay at Browntown Resort is already arranged for the nights of March 12th, 13th, and 14th.
Check-out will be March 15th at 11:00 AM (after breakfast).
No separate booking required ✨</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">What documents are needed for check-in?</h3>
                <p className="faq-answer">A valid government-issued ID is required for all guests at check-in.
Please ensure everyone in your group (including children) carries their ID.</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">What’s happening once we arrive?</h3>
                <p className="faq-answer">We kick things off with a lunchtime gathering and the Pellikuturu ceremony, along with check-in.
Arrive, settle in, and let the celebrations begin!
</p>
              </div>

<div className="faq-item">
  <h3 className="faq-question">What are the events and dress codes?</h3>
  
  <div className="faq-answer">
    <h4>March 12</h4>
    <p><strong>Pellikuturu Ceremony –</strong> Telugu Traditional</p>
    <p><strong>Mehendi Night –</strong> Warm Sunset Carnival</p>

    <h4>March 13</h4>
    <p><strong>Tilak –</strong> Classic Ethnic</p>
    <p><strong>Golden Haldi –</strong> Yellow Hues</p>

    <h4>March 14</h4>
    <p><strong>Wedding Ceremony –</strong> Indian Traditional</p>
    <p><strong>Reception –</strong> Glitz & Glam</p>

    <p>
      Dress codes are optional and meant as inspiration. <br />
      Yellow is warmly encouraged for Haldi 💛
    </p>
  </div>
</div>

              <div className="faq-item">
                <h3 className="faq-question">How do I get to the resort?</h3>
                <p className="faq-answer">Group transportation will be arranged for guests traveling from outside Hyderabad.
This will be coordinated based on the travel details you’ve shared with us.</p>
              </div>
  
  <div className="faq-item">
                <h3 className="faq-question">Can I extend my stay?</h3>
                <p className="faq-answer">Accommodation is covered for March 12th–14th.
If you plan to arrive earlier or stay longer, we kindly request that you book those additional nights separately.
Please note: With the event schedule, it may be difficult to leave the venue during these dates.
</p>
              </div>
  
              <div className="faq-item">
                <h3 className="faq-question">Do you have a gift registry?</h3>
                <p className="faq-answer">Your presence and blessings are the greatest gifts. Truly 💛</p>
              </div>
  
              <div className="faq-item">
                            <h3 className="faq-question">Who can I contact during the wedding?</h3>
              <div className="faq-answer">
                <p><strong>Event Management Team:</strong> Wizard Entertainment</p>
                <p><strong>Point of Contact:</strong> Paramjeet Singh</p>
                <p><strong>Phone:</strong> +91 70939 34489</p>
            
                <p>
                  Paramjeet will be your go-to person for any assistance during the festivities.
                </p>
              </div>
              </div>
                  <div className="faq-item">
                <h3 className="faq-question">Kindly Note</h3>
  <div className="faq-answer">
    <p>The following services are payable directly by guests:</p>
    
    <ul>
      <li>Room service (food, beverages, dry cleaning, etc.)</li>
      <li>Hotel concierge services</li>
      <li>Make-up, hair, and saree/lehenga draping services</li>
    </ul>
  </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
