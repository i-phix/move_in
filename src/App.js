import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import router from './router/routes';

function App() {
  const spinner = useSelector((state) => state.authenticationReducer.spinner);

  return (
    <>
      {spinner && (
        <div className="page-loader">
          <div className="bar" />
        </div>
      )}
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
}

export default App;
