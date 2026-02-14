// Displays individual listing with status & update button
import React from 'react';
import { Listing } from '../services/listingService';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ListingCardProps {
  listing: Listing;
  onDelete?: () => void;
  onClick?: () => void;
  isHearted?: boolean;
  onHeartClick?: (id: number) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onDelete, onClick, isHearted = false, onHeartClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/listings/${listing.id}`);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/listings/${listing.id}`);
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
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleCardClick}
    >
      <div className="relative aspect-w-16 aspect-h-9">
        {listing.images?.[0] && (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              listing.status
            )}`}
          >
            {listing.status}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-1">{listing.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
            <p className="text-orange-500 font-bold mb-2">${listing.price}</p>
            <p className="text-gray-500 text-sm mb-2">
              Condition: <span className="capitalize">{listing.condition || 'Not specified'}</span>
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHeartClick?.(listing.id);
            }}
            className={`text-2xl ${isHearted ? 'text-red-500' : 'text-gray-400'}`}
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
