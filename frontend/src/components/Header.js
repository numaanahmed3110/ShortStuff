import React from "react";

const Header = () => {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-5xl font-bold text-pink-500">Shawty</h1>
        <div>
          <button className="mr-4 text-gray-300 hover:text-white">Login</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Register Now
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
