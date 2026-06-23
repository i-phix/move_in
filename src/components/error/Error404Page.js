import React from 'react';
import { Link } from 'react-router-dom';

function Error404Page() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-4">
      <div className="panel-card p-5 text-center" style={{ maxWidth: 520 }}>
        <div className="display-1 fw-semibold text-primary mb-3">404</div>
        <h1 className="h3 mb-2">Page not found</h1>
        <p className="text-secondary mb-4">
          The route does not exist in the current Move In scaffold.
        </p>
        <Link className="btn btn-primary" to="/">
          Go to login
        </Link>
      </div>
    </div>
  );
}

export default Error404Page;
