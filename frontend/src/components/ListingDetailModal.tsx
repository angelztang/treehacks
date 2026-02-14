import React, { useState } from 'react';
import { Listing } from '../services/listingService';
import { requestToBuy } from '../services/listingService';

interface ListingDetailModalProps {
  listing: Listing;
  isHearted: boolean;
  onHeartClick: () => void;
  onClose: () => void;
  onUpdate?: () => void;
  onListingUpdated?: () => void;
}

const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ 
  listing, 
  isHearted,
  onHeartClick,
  onClose, 
  onUpdate,
  onListingUpdated
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleNotifySeller = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await requestToBuy(listing.id);
      setNotificationSent(true);
      if (onUpdate) {
        onUpdate();
      }
      if (onListingUpdated) {
        onListingUpdated();
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send notification';
      const errorDetails = error.response?.data?.details || '';
      setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-white text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{listing.title}</h2>
            <div className="flex space-x-2">
              <button
                onClick={onHeartClick}
                className={`p-2 rounded-full ${
                  isHearted ? 'text-red-500' : 'text-gray-400'
                } hover:text-red-500 transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill={isHearted ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="relative mb-6">
            <div className="h-96 w-full">
              {listing.images?.[currentImageIndex] && (
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-contain rounded-lg bg-gray-100"
                />
              )}
            </div>
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="flex justify-center mt-2 space-x-2">
              {listing.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Listing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{listing.description}</p>
            </div>
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Price</h3>
                <p className="text-2xl font-bold text-orange-500">${listing.price}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Category</h3>
                <p className="text-gray-600">{listing.category}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Condition</h3>
                <p className="text-gray-600">{listing.condition || 'Not specified'}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.status)}`}>
                  {listing.status}
                </span>
              </div>
            </div>
          </div>

          {/* Notification Button */}
          {!notificationSent && (
            <div className="mt-6">
              <button
                onClick={handleNotifySeller}
                disabled={isSubmitting}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Notify Seller to Buy'}
              </button>
            </div>
          )}

          {notificationSent && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
              <p className="font-semibold">Notification sent successfully!</p>
              <p className="text-sm mt-1">The seller will be notified via email.</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
              <p className="font-semibold">Failed to send notification</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailModal; 