import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../components/useAuth';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (user?.role === 'Admin') navigate('/admin/dashboard');
    else if (user?.role === 'Member') navigate('/member/dashboard');
    else navigate('/login');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full border-t-4 border-red-500">
        <h1 className="text-4xl font-black text-gray-800 mb-2">403</h1>
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You do not have the required permissions to view this page. If you believe this is a mistake, please contact your project administrator.
        </p>
        <button 
          onClick={handleGoBack}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm w-full"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
