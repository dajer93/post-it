import { API_URL } from './config';

// Register user
export const register = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Login user
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

// Get user profile
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get profile');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to get profile');
  }
};

// Update user profile
export const updateUserProfile = async (userInfo, token) => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userInfo),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Upload profile picture to S3
export const uploadProfilePicture = async (imageUri, token) => {
  try {
    // Convert base64 data URI to blob
    const base64 = imageUri.split(',')[1];
    const imageBlob = await fetch(imageUri).then(res => res.blob());
    
    // Create form data with the image
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg', 
      name: 'profile-picture.jpg'
    });

    // Upload to the server
    const response = await fetch(`${API_URL}/users/profile/picture`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload profile picture');
    }

    return data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error(error.message || 'Failed to upload profile picture');
  }
}; 