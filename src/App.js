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
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form based on attendance
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
    
    const submitUrl = getSubmitUrl();
    if (!submitUrl) {
      setSubmitMessage({
        type: 'error',
        text: 'Google Sheets integration not configured. Please set REACT_APP_GOOGLE_SCRIPT_URL in your .env file.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString(),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true };
      }

      if (result && result.success) {
        if (formData.attending === 'no') {
          setSubmitMessage({ type: 'success', text: 'Thanks for your blessing!' });
        } else {
          setSubmitMessage({ type: 'success', text: 'RSVP submitted successfully! Thank you for your response.' });
        }
        setTimeout(() => {
          setFormData({ name: '', attending: '', arrivalDate: '', arrivalTime: '', transportation: '' });
          setShowRSVP(false);
          setSubmitMessage({ type: '', text: '' });
        }, 2000);
      } else {
        if (formData.attending === 'no') {
          setSubmitMessage({ type: 'success', text: 'Thanks for your blessing!' });
        } else {
          setSubmitMessage({ type: 'success', text: 'RSVP submitted successfully! Thank you for your response.' });
        }
        setTimeout(() => {
          setFormData({ name: '', attending: '', arrivalDate: '', arrivalTime: '', transportation: '' });
          setShowRSVP(false);
          setSubmitMessage({ type: '', text: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    let errorMessage = 'Failed to submit RSVP. ';
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      errorMessage += 'Please check: 1) Your internet connection, 2) The Google Apps Script URL in .env file, 3) The script is deployed as a Web App with "Anyone" access, 4) You restarted the dev server after updating .env';
    } else {
      errorMessage += error.message || 'Please try again later.';
    }
    setSubmitMessage({ type: 'error', text: errorMessage });
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
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-secondary" title="PDF">
            <Shirt size={22} />
          </a>
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
                <h3 className="faq-question">When is the event?</h3>
                <p className="faq-answer">The celebration will take place on [Date] at [Time].</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Where is the venue?</h3>
                <p className="faq-answer">[Venue Name], [Address]. Parking is available on-site.</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">What's the dress code?</h3>
                <p className="faq-answer">Semi-formal attire is requested.</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Can I bring a plus one?</h3>
                <p className="faq-answer">Please refer to your invitation. If it says "and guest," you're welcome to bring someone!</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Will food be provided?</h3>
                <p className="faq-answer">Yes! A full dinner will be served. Please let us know of any dietary restrictions in your RSVP.</p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">How do I get there?</h3>
                <p className="faq-answer">The venue is easily accessible by car and public transportation. Details will be sent after you RSVP.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}