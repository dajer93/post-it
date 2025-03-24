import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { AuthContext } from './AuthContext';
import { getNearbyMessages } from '../api/messages';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userToken } = useContext(AuthContext);

  // Request location permissions and get initial location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          Alert.alert(
            'Location Permission Required',
            'This app needs access to your location to show nearby messages.',
            [{ text: 'OK' }]
          );
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
        setErrorMsg('Error getting location: ' + error.message);
      }
    })();
  }, []);

  // Fetch nearby messages when location changes or at 5 second intervals
  useEffect(() => {
    if (!location || !userToken) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const nearbyMessages = await getNearbyMessages(
          location.latitude,
          location.longitude,
          userToken
        );
        setMessages(nearbyMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch messages initially
    fetchMessages();

    // Set up interval to fetch messages every 5 seconds
    const intervalId = setInterval(fetchMessages, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [location, userToken]);

  // Watch for location changes
  useEffect(() => {
    if (!userToken) return;

    let locationSubscription;
    
    const startLocationUpdates = async () => {
      try {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Update if the user moves by 10 meters
          },
          (newLocation) => {
            setLocation(newLocation.coords);
          }
        );
      } catch (error) {
        setErrorMsg('Error watching position: ' + error.message);
      }
    };

    startLocationUpdates();

    // Clean up subscription when component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [userToken]);

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
  };

  const removeMessage = (messageId) => {
    setMessages((prevMessages) => 
      prevMessages.filter((message) => message._id !== messageId)
    );
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        errorMsg,
        messages,
        isLoading,
        addMessage,
        removeMessage,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}; 