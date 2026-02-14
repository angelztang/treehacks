// not sure if this is in use & what it's doing
import React, { useState, useRef, useEffect } from 'react';
import { Listing, updateListing, deleteListing, uploadImages } from '../services/listingService';
import ListingForm from './ListingForm';

interface ListingEditModalProps {
  listing: Listing;
  onClose: () => void;
  onUpdate: () => void;
}

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  condition: string;
}

const categories = [
  'tops',
  'bottoms',
  'dresses',
  'shoes',
  'furniture',
  'appliances', 
  'books',
  'other'
];

const ListingEditModal: React.FC<ListingEditModalProps> = ({ listing, onClose, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteListing(listing.id);
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to delete listing. Please try again.');
      console.error('Error deleting listing:', err);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };


  const handleSubmit = async (formData: ListingFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateListing(listing.id, {
        ...formData,
        price: parseFloat(formData.price.toString())
      });
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to update listing. Please try again.');
      console.error('Error updating listing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Listing</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <ListingForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialData={{
            title: listing.title,
            description: listing.description,
            price: listing.price,
            category: listing.category,
            images: listing.images,
            condition: listing.condition
          }}
        />

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete Listing
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="mb-6">Are you sure you want to delete this listing? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingEditModal; 