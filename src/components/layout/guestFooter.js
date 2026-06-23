import React from 'react';

function GuestFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="guest-footer">
      <div className="guest-footer-inner">
        <span>© {year} PayServe Move-In. All rights reserved.</span>
        <span>Secure guest access</span>
      </div>
    </footer>
  );
}

export default GuestFooter;
