import React from "react";
import { Link } from "react-router-dom";
import logo from "../../images/logo.png";

// Shared layout for legal pages
function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="legal-header-content">
          <Link to="/" className="legal-logo">
            <img src={logo} alt="iSpace IRMS" />
            <span>i<span>Space</span></span>
          </Link>
          <nav className="legal-nav">
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="legal-content">
        <div className="legal-container">
          <h1>{title}</h1>
          <p className="legal-updated">Last updated: {lastUpdated}</p>
          
          <div className="legal-body">
            {children}
          </div>

          <div className="legal-footer-nav">
            <Link to="/">← Back to Home</Link>
            <div className="legal-links">
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="legal-footer">
        <p>© {new Date().getFullYear()} iSpace Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Terms of Service Page
export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="November 1, 2026">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the iSpace Internal Referral Management System ("IRMS" or "Service"), 
          you agree to be bound by these Terms of Service. If you do not agree to these terms, 
          please do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>
          iSpace IRMS is an employee referral management platform that enables organizations to:
        </p>
        <ul>
          <li>Post and manage job openings</li>
          <li>Accept and track employee referrals</li>
          <li>Manage candidate applications throughout the hiring process</li>
          <li>Generate analytics and reports on referral activities</li>
        </ul>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <h3>3.1 Registration</h3>
        <p>
          To use certain features of the Service, you must register for an account. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information during registration</li>
          <li>Maintain and promptly update your account information</li>
          <li>Keep your password secure and confidential</li>
          <li>Notify us immediately of any unauthorized access to your account</li>
        </ul>

        <h3>3.2 Account Responsibility</h3>
        <p>
          You are responsible for all activities that occur under your account. We reserve the right 
          to suspend or terminate accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
          <li>Submit false, misleading, or fraudulent information</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Interfere with or disrupt the Service or its servers</li>
          <li>Upload viruses, malware, or other malicious code</li>
          <li>Harvest or collect user information without consent</li>
          <li>Use automated systems to access the Service without permission</li>
        </ul>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by iSpace 
          Technologies and are protected by international copyright, trademark, patent, trade secret, 
          and other intellectual property laws.
        </p>
        <p>
          You retain ownership of any content you submit to the Service, but grant us a license to 
          use, store, and display such content as necessary to provide the Service.
        </p>
      </section>

      <section>
        <h2>6. Privacy</h2>
        <p>
          Your use of the Service is also governed by our <Link to="/privacy">Privacy Policy</Link>, 
          which describes how we collect, use, and protect your personal information.
        </p>
      </section>

      <section>
        <h2>7. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your data. However, no method 
          of transmission over the Internet is 100% secure. You acknowledge that you provide 
          information at your own risk.
        </p>
      </section>

      <section>
        <h2>8. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
          EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, 
          SECURE, OR ERROR-FREE.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, ISPACE TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY 
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE 
          OF THE SERVICE.
        </p>
      </section>

      <section>
        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless iSpace Technologies from any claims, damages, 
          losses, or expenses arising from your use of the Service or violation of these terms.
        </p>
      </section>

      <section>
        <h2>11. Modifications to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will notify users of significant 
          changes via email or through the Service. Continued use after changes constitutes acceptance 
          of the modified terms.
        </p>
      </section>

      <section>
        <h2>12. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without 
          prior notice, for conduct that we believe violates these terms or is harmful to other users, 
          us, or third parties.
        </p>
      </section>

      <section>
        <h2>13. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable laws, without 
          regard to conflict of law principles.
        </p>
      </section>

      <section>
        <h2>14. Contact Information</h2>
        <p>
          For questions about these Terms of Service, please contact us at:
        </p>
        <ul>
          <li>Email: legal@ispace.com</li>
          <li>Address: iSpace Technologies, Corporate Office</li>
        </ul>
      </section>
    </LegalLayout>
  );
}

// Privacy Policy Page
export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="November 1, 2026">
      <section>
        <h2>1. Introduction</h2>
        <p>
          iSpace Technologies ("we," "our," or "us") is committed to protecting your privacy. This 
          Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
          you use our Internal Referral Management System (IRMS).
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register</li>
          <li><strong>Profile Information:</strong> Professional details, work experience, skills, and resume</li>
          <li><strong>Referral Information:</strong> Details about candidates you refer, including their contact information and qualifications</li>
          <li><strong>Application Data:</strong> Information submitted during job applications</li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data:</strong> Pages visited, features used, actions taken within the Service</li>
          <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
          <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Provide, maintain, and improve the Service</li>
          <li>Process job applications and referrals</li>
          <li>Send notifications about application status updates</li>
          <li>Communicate with you about the Service</li>
          <li>Analyze usage patterns to enhance user experience</li>
          <li>Ensure security and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>4. Information Sharing</h2>
        <p>We may share your information with:</p>
        <ul>
          <li><strong>Your Organization:</strong> HR administrators and hiring managers within your company</li>
          <li><strong>Service Providers:</strong> Third parties who assist in operating the Service</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
        </ul>
        <p>
          We do not sell your personal information to third parties.
        </p>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is active or as needed to 
          provide the Service. We may retain certain information as required by law or for legitimate 
          business purposes, such as resolving disputes and enforcing agreements.
        </p>
      </section>

      <section>
        <h2>6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal 
          information, including:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and audits</li>
          <li>Access controls and authentication mechanisms</li>
          <li>Employee training on data protection</li>
        </ul>
      </section>

      <section>
        <h2>7. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Correction:</strong> Request correction of inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information</li>
          <li><strong>Portability:</strong> Receive your data in a portable format</li>
          <li><strong>Restriction:</strong> Request restriction of processing</li>
          <li><strong>Objection:</strong> Object to certain types of processing</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information provided below.
        </p>
      </section>

      <section>
        <h2>8. Cookies and Tracking</h2>
        <p>
          We use cookies and similar technologies to enhance your experience. These include:
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for the Service to function</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
          <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
        </ul>
        <p>
          You can control cookie settings through your browser preferences.
        </p>
      </section>

      <section>
        <h2>9. Third-Party Links</h2>
        <p>
          The Service may contain links to third-party websites. We are not responsible for the 
          privacy practices of these external sites. We encourage you to review their privacy 
          policies before providing any personal information.
        </p>
      </section>

      <section>
        <h2>10. Children's Privacy</h2>
        <p>
          The Service is not intended for individuals under the age of 18. We do not knowingly 
          collect personal information from children. If we become aware that we have collected 
          information from a child, we will take steps to delete it.
        </p>
      </section>

      <section>
        <h2>11. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. 
          We ensure appropriate safeguards are in place to protect your information in accordance 
          with this Privacy Policy.
        </p>
      </section>

      <section>
        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material 
          changes by posting the new policy on this page and updating the "Last updated" date. 
          Your continued use of the Service after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2>13. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy or our data practices, 
          please contact us at:
        </p>
        <ul>
          <li>Email: privacy@ispace.com</li>
          <li>Address: iSpace Technologies, Corporate Office</li>
        </ul>
      </section>
    </LegalLayout>
  );
}
