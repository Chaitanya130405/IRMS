import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../images/logo.png";

// Animated counter hook
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, started]);

  return [count, () => setStarted(true)];
}



// Floating shapes background component - simplified
function FloatingShapes() {
  return null; // Removed for cleaner look
}

// Feature card component
function FeatureCard({ number, title, description, icon }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>
      <span className="feature-number">{number}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

// Testimonial component
function Testimonial({ quote, author, role, company, avatar }) {
  return (
    <div className="testimonial">
      <div className="testimonial-quote">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
        </svg>
        <p>{quote}</p>
      </div>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{avatar}</div>
        <div>
          <strong>{author}</strong>
          <span>{role} at {company}</span>
        </div>
      </div>
    </div>
  );
}

// Smooth scroll to section
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Counter animation - start on page load
  const [hires, startHires] = useCounter(2500);
  const [referrals, startReferrals] = useCounter(15000);
  const [companies, startCompanies] = useCounter(150);

  useEffect(() => {
    // Start counters after a brief delay
    const timer = setTimeout(() => {
      startHires();
      startReferrals();
      startCompanies();
    }, 500);
    return () => clearTimeout(timer);
  }, [startHires, startReferrals, startCompanies]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How it works" },
    { id: "testimonials", label: "Testimonials" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="landing">
      <FloatingShapes />
      
      {/* Navigation */}
      <header className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <Link to="/" className="landing-brand">
          <img src={logo} alt="iSpace IRMS" />
          <span className="brand-text">
            i<span>Space</span>
          </span>
        </Link>
        
        <nav className={`landing-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {navLinks.map(link => (
            <button
              key={link.id}
              className="nav-link-btn unstyled"
              onClick={() => {
                scrollToSection(link.id);
                setMobileMenuOpen(false);
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
        
        <div className="landing-actions">
          <Link className="login-link" to="/login">
            Log in
          </Link>
          <Link className="signup-link" to="/register">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn unstyled" 
          aria-label="Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main>
        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: HERO
            ═══════════════════════════════════════════════════════════════ */}
        <section id="hero" className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              REFERRAL RECRUITMENT, SIMPLIFIED
            </div>
            
            <h1>
              Turn great referrals into{" "}
              <em>great hires.</em>
            </h1>
            
            <p className="hero-description">
              iSpace brings candidates, employee referrals, and HR teams into one 
              transparent recruitment workflow. Streamline your hiring process and 
              build stronger teams.
            </p>
            
            <div className="hero-actions">
              <Link className="hero-primary" to="/register">
                Start hiring smarter
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <button 
                className="hero-secondary unstyled"
                onClick={() => scrollToSection("how-it-works")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                </svg>
                See how it works
              </button>
            </div>
            
            <div className="trust">
              <div className="trust-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Track every application
              </div>
              <div className="trust-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Keep candidates informed
              </div>
              <div className="trust-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Hire with confidence
              </div>
            </div>
          </div>

          <div className="hero-visual">
            {/* Animated orbits */}
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            
            {/* Floating cards */}
            <div className="visual-card top-card">
              <div className="card-header">
                <span className="card-badge">NEW REFERRAL</span>
                <span className="card-time">Just now</span>
              </div>
              <strong>Senior Product Designer</strong>
              <p>Referred by Employee</p>
              <div className="card-footer">
                <span className="priority-badge high">High Priority</span>
              </div>
            </div>

            <div className="visual-card main-card">
              <div className="candidate-icon">
                <span>AS</span>
                <span className="online-dot" />
              </div>
              <div className="candidate-info">
                <small>CANDIDATE PROFILE</small>
                <h3>Application Received</h3>
                <p>Product Designer · 6 years exp.</p>
              </div>
              <span className="status-dot">
                <span className="status-pulse" />
                Under review
              </span>
            </div>

            <div className="visual-card bottom-card">
              <div className="progress-header">
                <span>Application Progress</span>
                <span className="progress-percent">67%</span>
              </div>
              <div className="progress">
                <i />
                <i />
                <i className="pending" />
              </div>
              <div className="progress-steps">
                <span className="step complete">Applied</span>
                <span className="step complete">Review</span>
                <span className="step">Interview</span>
              </div>
            </div>

            {/* Extra floating elements */}
            <div className="floating-badge badge-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Top Rated
            </div>
            <div className="floating-badge badge-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified
            </div>
          </div>

          {/* Scroll indicator */}
          <button 
            className="scroll-indicator unstyled"
            onClick={() => scrollToSection("stats")}
            aria-label="Scroll to stats"
          >
            <span>Scroll to explore</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: STATS
            ═══════════════════════════════════════════════════════════════ */}
        <section id="stats" className="stats-section">
          <div className="landing-stats">
            <div className="stat">
              <span className="stat-number">{hires.toLocaleString()}+</span>
              <span className="stat-label">Successful Hires</span>
            </div>
            <div className="stat">
              <span className="stat-number">{referrals.toLocaleString()}+</span>
              <span className="stat-label">Referrals Processed</span>
            </div>
            <div className="stat">
              <span className="stat-number">{companies.toLocaleString()}+</span>
              <span className="stat-label">Companies Trust Us</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: FEATURES
            ═══════════════════════════════════════════════════════════════ */}
        <section id="features" className="feature-section">
          <div className="section-header">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              POWERFUL FEATURES
            </span>
            <h2>Everything you need to hire better</h2>
            <p>Streamline your entire recruitment process with our comprehensive suite of tools designed for modern hiring teams.</p>
          </div>

          <div className="feature-grid">
            <FeatureCard
              number="01"
              title="Smart Referral Capture"
              description="Capture relationship context, recommendations, and all relevant candidate details in one thoughtful, structured submission."
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              }
            />
            <FeatureCard
              number="02"
              title="Streamlined Reviews"
              description="Give HR teams powerful filters, status controls, and a complete audit trail for every application in the pipeline."
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
            />
            <FeatureCard
              number="03"
              title="Real-time Updates"
              description="Automatic notifications mean candidates can follow their progress without repeatedly chasing the hiring team."
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              }
            />
            <FeatureCard
              number="04"
              title="Analytics Dashboard"
              description="Track hiring metrics, referral success rates, and time-to-hire with beautiful, actionable analytics."
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              }
            />
            <FeatureCard
              number="05"
              title="Role-based Access"
              description="Candidates, HR teams, and admins each get tailored views and permissions that match their responsibilities."
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              }
            />
            <FeatureCard
              number="06"
              title="Export & Reports"
              description="Generate comprehensive reports and export data in multiple formats for stakeholder presentations."
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: HOW IT WORKS
            ═══════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="how-it-works-section">
          <div className="section-header">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              HOW IT WORKS
            </span>
            <h2>Simple steps to better hiring</h2>
            <p>Get started in minutes and transform how your organization handles employee referrals.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <h3>Create Account</h3>
              <p>Sign up in seconds as a candidate or get invited by your HR team as an admin.</p>
            </div>

            <div className="step-connector">
              <svg width="40" height="12" viewBox="0 0 40 12">
                <path d="M0 6h35M30 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Submit Referral</h3>
              <p>Fill out the referral form with candidate details, your relationship, and upload their resume.</p>
            </div>

            <div className="step-connector">
              <svg width="40" height="12" viewBox="0 0 40 12">
                <path d="M0 6h35M30 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Track Progress</h3>
              <p>Monitor your referral's journey through the hiring pipeline with real-time status updates.</p>
            </div>

            <div className="step-connector">
              <svg width="40" height="12" viewBox="0 0 40 12">
                <path d="M0 6h35M30 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>Celebrate Hires</h3>
              <p>Watch your referrals become valued team members and help build a stronger organization.</p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5: TESTIMONIALS
            ═══════════════════════════════════════════════════════════════ */}
        <section id="testimonials" className="testimonials-section">
          <div className="section-header">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              TESTIMONIALS
            </span>
            <h2>Loved by HR teams everywhere</h2>
            <p>See what hiring managers and recruiters say about transforming their referral process.</p>
          </div>

          <div className="testimonials-grid">
            <Testimonial
              quote="iSpace has completely transformed how we handle employee referrals. The transparency and tracking features have increased our referral hires by 40%."
              author="Hiring Manager"
              role="Head of Talent"
              company="Tech Company"
              avatar="HM"
            />
            <Testimonial
              quote="Finally, a system that keeps everyone in the loop. Candidates love knowing where they stand, and our HR team saves hours every week."
              author="HR Director"
              role="HR Director"
              company="StartupXYZ"
              avatar="HD"
            />
            <Testimonial
              quote="The analytics and reporting features give us insights we never had before. We can now measure the true impact of our referral program."
              author="Recruitment Lead"
              role="Recruitment Lead"
              company="GlobalTech"
              avatar="RL"
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6: CTA / CONTACT
            ═══════════════════════════════════════════════════════════════ */}
        <section id="contact" className="contact-section">
          <div className="cta-content">
            <span className="eyebrow light">
              <span className="eyebrow-dot" />
              GET STARTED TODAY
            </span>
            <h2>Ready to make referrals work harder?</h2>
            <p>Join hundreds of companies using iSpace to build better teams through employee referrals.</p>
            <div className="cta-actions">
              <Link className="cta-primary" to="/register">
                Start free trial
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a className="cta-secondary" href="mailto:hello@ispace.com">
                Contact sales
              </a>
            </div>
          </div>
          <div className="cta-decoration">
            <div className="cta-circle cta-circle-1" />
            <div className="cta-circle cta-circle-2" />
            <div className="cta-circle cta-circle-3" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={logo} alt="iSpace" />
            <span>i<span>Space</span></span>
            <p>Making recruitment referrals simple, transparent, and effective.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <button className="footer-link unstyled" onClick={() => scrollToSection("features")}>Features</button>
              <button className="footer-link unstyled" onClick={() => scrollToSection("how-it-works")}>How it works</button>
              <button className="footer-link unstyled" onClick={() => scrollToSection("testimonials")}>Testimonials</button>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <button className="footer-link unstyled" onClick={() => scrollToSection("contact")}>Contact</button>
              <a href="#">About us</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} iSpace Recruitment Platform. All rights reserved.</p>
          <p>Built for better hiring.</p>
        </div>
      </footer>
    </div>
  );
}
