import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/ListingForm';
import { createListing, CreateListingData } from '../services/listingService';
import { getUserId } from '../services/authService';

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  condition: string;
  user_id: number;
}

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ListingFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userId = getUserId();
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const listingData: CreateListingData = {
        ...formData
      };

      await createListing(listingData);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create listing. Please try again.');
      console.error('Error creating listing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill out the form below to create your listing
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <ListingForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CreateListing; 