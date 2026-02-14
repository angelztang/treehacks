import React, { useState, useEffect } from 'react';
import { getBuyerListings, Listing } from '../services/listingService';
import { getUserId } from '../services/authService';

const BuyerDashboard: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getUserId();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        if (!userId) {
          throw new Error('No user id found');
        }
        console.log('Fetching listings for user id:', userId);
        const data = await getBuyerListings(userId);
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [userId]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default BuyerDashboard; 