import { API_URL } from './config';

// Create a new message
export const createMessage = async (content, latitude, longitude, token) => {
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, latitude, longitude }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create message');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create message');
  }
};

// Get nearby messages (within 100m radius)
export const getNearbyMessages = async (latitude, longitude, token) => {
  try {
    const response = await fetch(
      `${API_URL}/messages/nearby?latitude=${latitude}&longitude=${longitude}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get nearby messages');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to get nearby messages');
  }
};

// Delete a message
export const deleteMessage = async (messageId, token) => {
  try {
    const response = await fetch(`${API_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete message');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete message');
  }
}; 