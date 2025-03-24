import { Stack } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';

export default function AuthLayout() {
  const { userToken } = useContext(AuthContext);

  // If user is already logged in, redirect to the app
  if (userToken) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
} 