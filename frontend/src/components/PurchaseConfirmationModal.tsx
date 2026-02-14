import React, { useState } from 'react';
import { Listing } from '../services/listingService';

interface PurchaseConfirmationModalProps {
  listing: Listing;
  onClose: () => void;
  onConfirm: (message: string, contactInfo: string) => void;
}

const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  listing,
  onClose,
  onConfirm,
}) => {
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm(message, contactInfo);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Confirm Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            You are about to purchase <span className="font-semibold">{listing.title}</span> for{' '}
            <span className="font-semibold">${listing.price}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message to Seller
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Let the seller know when you'd like to meet up..."
            />
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
              Contact Information
            </label>
            <input
              type="text"
              id="contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Your phone number or email"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseConfirmationModal; 