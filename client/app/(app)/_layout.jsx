import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { Redirect } from 'expo-router';
import { Icon } from '@rneui/themed';

import { AuthContext } from '../../src/context/AuthContext';

export default function AppLayout() {
  const { userToken } = useContext(AuthContext);

  // If user is not logged in, redirect to auth
  if (!userToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#3f51b5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'index') {
            iconName = 'chat';
          } else if (route.name === 'map') {
            iconName = 'map';
          } else if (route.name === 'profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3f51b5',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Messages',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
} 