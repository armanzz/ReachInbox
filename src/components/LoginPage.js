import React from 'react';

const LoginPage = () => {
 const redirect = 'https://reachinbox-z9vh.onrender.com';

const handleLogin = () => {
    window.location.href = `https://hiring.reachinbox.xyz/api/v1/auth/google-login?redirect_to=${redirect}`;
};


  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Navbar */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold text-white">REACHINBOX</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center flex-1">
        <div className="bg-gray-800 text-white p-8 rounded-md shadow-lg">
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold">Create a new account</h1>
          </div>
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={handleLogin}
              className="flex items-center bg-gray-700 p-3 rounded-md"
            >
              <img src="/google2.png" alt="Google" className="w-5 h-5 mr-2" />
              Sign Up with Google
            </button>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 w-full p-3 rounded-md">
            Create an Account
          </button>
          <div className="text-center mt-4">
            <span className="text-gray-400">Already have an account? </span>
            <a href="/login" className="text-blue-500">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
