// this should be buyer's purchase history, similar to SellerDashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, getBuyerListings, getHeartedListings, heartListing, unheartListing } from '../services/listingService';
import { getUserId } from '../services/authService';
import ListingCard from '../components/ListingCard';
import ListingDetailModal from '../components/ListingDetailModal';

type FilterTab = 'all' | 'pending' | 'purchased' | 'hearted';

const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [heartedListings, setHeartedListings] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const fetchListings = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      const data = await getBuyerListings(userId);
      setListings(data);
    } catch (err) {
      setError('Failed to fetch listings');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleHeartClick = async (id: number) => {
    try {
      if (heartedListings.includes(id)) {
        await unheartListing(id);
        setHeartedListings(heartedListings.filter(listingId => listingId !== id));
      } else {
        await heartListing(id);
        setHeartedListings([...heartedListings, id]);
      }
      // If we're on the hearted filter, refresh the listings
      if (activeFilter === 'hearted') {
        const userId = getUserId();
        if (userId) {
          const response = await getBuyerListings(userId);
          setListings(response);
        }
      }
    } catch (error) {
      console.error('Error toggling heart:', error);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return listing.status === 'pending';
    if (activeFilter === 'purchased') return listing.status === 'sold';
    if (activeFilter === 'hearted') return heartedListings.includes(listing.id);
    return false;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Purchases</h1>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded ${
            activeFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-200'
          }`}
        >
          All Listings
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded ${
            activeFilter === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveFilter('purchased')}
          className={`px-4 py-2 rounded ${
            activeFilter === 'purchased' ? 'bg-orange-500 text-white' : 'bg-gray-200'
          }`}
        >
          Purchased
        </button>
        <button
          onClick={() => setActiveFilter('hearted')}
          className={`px-4 py-2 rounded ${
            activeFilter === 'hearted' ? 'bg-orange-500 text-white' : 'bg-gray-200'
          }`}
        >
          Hearted
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-xl">No items found</p>
          <p className="text-sm mt-2">
            {activeFilter === 'all' ? "You don't have any listings yet" :
             activeFilter === 'pending' ? "You don't have any pending listings" :
             activeFilter === 'purchased' ? "You haven't purchased any items yet" :
             "You haven't hearted any items yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isHearted={heartedListings.includes(listing.id)}
              onHeartClick={() => handleHeartClick(listing.id)}
            />
          ))}
        </div>
      )}

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          isHearted={heartedListings.includes(selectedListing.id)}
          onHeartClick={() => handleHeartClick(selectedListing.id)}
          onClose={() => setSelectedListing(null)}
          onUpdate={fetchListings}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;