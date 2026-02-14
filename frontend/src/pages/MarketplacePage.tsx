import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { Listing, getListings, heartListing, unheartListing, getHeartedListings } from '../services/listingService';
import ListingDetailModal from '../components/ListingDetailModal';

interface PriceRange {
  label: string;
  max: number;
}

interface Category {
  name: string;
  image: string;
  slug: string;
}

const MarketplacePage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [heartedListings, setHeartedListings] = useState<number[]>([]);

  const priceRanges: PriceRange[] = [
    { label: 'Under $10', max: 10 },
    { label: 'Under $15', max: 15 },
    { label: 'Under $20', max: 20 },
    { label: 'Under $50', max: 50 },
  ];

  const categories: Category[] = [
    { name: 'Tops', image: '/categories/tops.png', slug: 'tops' },
    { name: 'Bottoms', image: '/categories/bottoms.png', slug: 'bottoms' },
    { name: 'Dresses', image: '/categories/dresses.png', slug: 'dresses' },
    { name: 'Shoes', image: '/categories/shoes.png', slug: 'shoes' },
    { name: 'Furniture', image: '/categories/furniture.png', slug: 'furniture' },
    { name: 'Appliances', image: '/categories/appliances.png', slug: 'appliances' },
    { name: 'Books', image: '/categories/books.png', slug: 'books' },
    { name: 'Other', image: '/categories/other.png', slug: 'other' },
  ];

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      // Always filter for available listings
      params.append('status', 'available');
      
      if (selectedPrice) {
        params.append('max_price', selectedPrice.toString());
      }
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const url = `?${params.toString()}`;
      const data = await getListings(url);
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeartedListings = async () => {
    try {
      const hearted = await getHeartedListings();
      setHeartedListings(hearted.map(listing => listing.id));
    } catch (error) {
      console.error('Error fetching hearted listings:', error);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchHeartedListings();
  }, [selectedPrice, selectedCategory, searchQuery]);

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');
    
    setSelectedCategory(categoryParam);
    setSearchQuery(searchParam);
    setSelectedPrice(null); // Reset price when URL changes
  }, [location.search]);

  const handleListingUpdated = () => {
    fetchListings();
    setSelectedListing(null); // Close any open modals
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? null : slug);
    setSelectedPrice(null); // Reset price filter when changing category
  };

  const handlePriceClick = (max: number) => {
    setSelectedPrice(selectedPrice === max ? null : max);
  };

  const handleHeartClick = async (id: number) => {
    try {
      const isHearted = heartedListings.includes(id);
      if (isHearted) {
        await unheartListing(id);
        setHeartedListings(prev => prev.filter(listingId => listingId !== id));
      } else {
        await heartListing(id);
        setHeartedListings(prev => [...prev, id]);
      }
    } catch (error: any) {
      console.error('Error toggling heart:', error);
      if (error.response?.status === 401) {
        alert('Please log in to heart listings');
      } else if (error.response?.status === 400) {
        if (error.response?.data?.error === 'Listing already hearted') {
          alert('You have already hearted this listing');
        } else if (error.response?.data?.error === 'Listing is not available') {
          alert('This listing is no longer available');
        } else {
          alert('Failed to heart listing: ' + error.response?.data?.error);
        }
      } else {
        alert('Failed to heart listing. Please try again.');
      }
    }
  };

  const filteredListings = listings.filter(listing => {
    // Always filter out non-available listings
    if (listing.status !== 'available') return false;
    // Then apply category and price filters if selected
    if (selectedCategory && listing.category.toLowerCase() !== selectedCategory) return false;
    if (selectedPrice && listing.price > selectedPrice) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-8">
          {/* Price Filters */}
          <div>
            <h2 className="text-xl font-bold mb-4">Price Range</h2>
            <div className="flex flex-wrap gap-4">
              {priceRanges.map((range) => (
                <button
                  key={range.max}
                  onClick={() => handlePriceClick(range.max)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPrice === range.max
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Header */}
          {searchQuery && filteredListings.length > 0 && (
            <div className="text-center py-4">
              <h2 className="text-xl font-bold">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-600 mt-2">
                Found {filteredListings.length} items
              </p>
            </div>
          )}

          {/* Listings Grid */}
          <div>
            <h2 className="text-xl font-bold mb-6">
              {searchQuery 
                ? 'Search Results' 
                : selectedCategory 
                  ? categories.find(cat => cat.slug === selectedCategory)?.name || 'Category Items'
                  : 'All Items'}
            </h2>
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">
                  {searchQuery
                    ? `No items found matching "${searchQuery}"`
                    : selectedCategory
                      ? `No items found in ${categories.find(cat => cat.slug === selectedCategory)?.name || 'this category'}`
                      : 'No items available in the marketplace yet'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchQuery || selectedCategory
                    ? 'Try adjusting your search or filters'
                    : 'Check back later or create a new listing'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isHearted={heartedListings.includes(listing.id)}
                    onHeartClick={handleHeartClick}
                    onClick={() => setSelectedListing(listing)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Listing Detail Modal */}
        {selectedListing && (
          <ListingDetailModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            onListingUpdated={handleListingUpdated}
            isHearted={heartedListings.includes(selectedListing.id)}
            onHeartClick={() => handleHeartClick(selectedListing.id)}
          />
        )}
      </div>
    </div>
  );
};

export default MarketplacePage; 