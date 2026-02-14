// Handles fetching, creating, and updating listings (API calls)

import { getUserId } from './authService';

const API_URL = 'https://tigerpop-marketplace-backend-76fa6fb8c8a2.herokuapp.com';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get request headers
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  status: 'available' | 'pending' | 'sold';
  isHearted?: boolean;
  user_id: number;
  user_netid: string;
  created_at: string;
  updated_at: string;
  images: string[];
  condition: string;
  seller_id: number;
  buyer_id?: number;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  user_id: number;
  condition: string;
}

export interface ListingFilters {
  max_price?: number;
  min_price?: number;
  category?: string;
  condition?: string;
  search?: string;
  include_sold?: boolean;
}

export const getListings = async (filters?: string): Promise<Listing[]> => {
  const url = filters ? `${API_URL}/api/listing/${filters}` : `${API_URL}/api/listing/`;
  const response = await fetch(url, {
    headers: getHeaders(),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const getListing = async (id: number): Promise<Listing> => {
  const response = await fetch(`${API_URL}/api/listing/${id}/`, {
    headers: getHeaders(),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const createListing = async (data: CreateListingData): Promise<Listing> => {
  const response = await fetch(`${API_URL}/api/listing/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const updateListing = async (id: number, data: Partial<Listing>): Promise<Listing> => {
  const response = await fetch(`${API_URL}/api/listing/${id}/`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const updateListingStatus = async (id: number, status: 'available' | 'sold'): Promise<Listing> => {
  const response = await fetch(`${API_URL}/api/listing/${id}/status/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const deleteListing = async (id: number): Promise<void> => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const response = await fetch(`${API_URL}/api/listing/${id}/?user_id=${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const headers = getHeaders();
    delete headers['Content-Type']; // Let the browser set the correct content type for FormData

    const response = await fetch(`${API_URL}/api/listing/upload/`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
      mode: 'cors'
    });
    
    const data = await handleResponse(response);
    if (!data.urls || !Array.isArray(data.urls)) {
      throw new Error('Invalid response format from server');
    }

    return data.urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/listing/categories/`, {
    headers: getHeaders(),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const getUserListings = async (userId: string): Promise<Listing[]> => {
  const response = await fetch(`${API_URL}/api/listing/user/?user_id=${userId}`, {
    headers: getHeaders(),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const requestToBuy = async (listingId: number): Promise<any> => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const response = await fetch(`${API_URL}/api/listing/${listingId}/buy/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        buyer_id: userId,
        message: 'I am interested in this item',
        contact_info: 'Please contact me via email'
      }),
      credentials: 'include',
      mode: 'cors'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export const getUserPurchases = async (): Promise<Listing[]> => {
  const response = await fetch(`${API_URL}/api/listing/purchases/`, {
    headers: getHeaders(),
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const getBuyerListings = async (netid: string): Promise<Listing[]> => {
  try {
    console.log('Fetching buyer listings for buyer_id:', netid);
    const response = await fetch(`${API_URL}/api/listing/buyer?buyer_id=${netid}`, {
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching buyer listings:', errorData);
      throw new Error(errorData.error || 'Failed to fetch buyer listings');
    }
    
    const data = await response.json();
    console.log('Received buyer listings:', data);
    return data;
  } catch (error) {
    console.error('Error in getBuyerListings:', error);
    throw error;
  }
};

export const heartListing = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please log in to heart listings');
    }
    const response = await fetch(`${API_URL}/api/listing/${id}/heart/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors'
    });
    return handleResponse(response);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to heart listings');
    }
    throw new Error('Failed to heart listing');
  }
};

export const unheartListing = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please log in to unheart listings');
    }
    const response = await fetch(`${API_URL}/api/listing/${id}/heart/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors'
    });
    return handleResponse(response);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to unheart listings');
    }
    throw new Error('Failed to unheart listing');
  }
};

export const getHeartedListings = async (): Promise<Listing[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }
    const response = await fetch(`${API_URL}/api/listing/hearted/`, {
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors'
    });
    if (!response.ok) {
      if (response.status === 401) return [];
      if (response.status === 422) {
        console.warn('Failed to fetch hearted listings (422)');
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching hearted listings:', error);
    return [];
  }
};
  