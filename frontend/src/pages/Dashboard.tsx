// Main dashboard with Buyer/Seller mode toggle
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../services/authService';
import { Listing } from '../services/listingService';
import SellerDashboard from "./SellerDashboard";
import BuyerDashboard from "./BuyerDashboard";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userInfo = getUserInfo();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [userInfo, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-8">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome, {userInfo?.username || userInfo?.id}!</p>
        </div>
        <button
          onClick={() => setMode(mode === "buyer" ? "seller" : "buyer")}
          className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          Switch to {mode === "buyer" ? "Seller" : "Buyer"} Mode
        </button>
      </div>

      {mode === "buyer" ? (
        <BuyerDashboard />
      ) : (
        <SellerDashboard />
      )}
    </div>
  );
};

export default Dashboard;
