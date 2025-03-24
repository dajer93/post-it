import { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login, register, getUserProfile } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const bootstrapAsync = async () => {
      try {
        setIsLoading(true);
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setUserToken(token);
          const userProfile = await getUserProfile(token);
          setUserInfo(userProfile);
        }
      } catch (error) {
        console.log('Error bootstrapping auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const loginUser = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(username, password);
      setUserToken(response.token);
      setUserInfo({
        _id: response._id,
        username: response.username,
        profilePicture: response.profilePicture,
      });
      await SecureStore.setItemAsync('userToken', response.token);
      return true;
    } catch (error) {
      setError(error.message || 'Failed to login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await register(username, password);
      setUserToken(response.token);
      setUserInfo({
        _id: response._id,
        username: response.username,
        profilePicture: response.profilePicture,
      });
      await SecureStore.setItemAsync('userToken', response.token);
      return true;
    } catch (error) {
      setError(error.message || 'Failed to register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUserToken(null);
    setUserInfo(null);
    await SecureStore.deleteItemAsync('userToken');
  };

  const updateUser = (updatedUserInfo) => {
    setUserInfo(updatedUserInfo);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        error,
        login: loginUser,
        register: registerUser,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 