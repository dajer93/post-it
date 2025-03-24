import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Stack } from 'expo-router';
import { LocationContext } from '../../src/context/LocationContext';

export default function MapScreen() {
  const { location, messages } = useContext(LocationContext);

  if (!location) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Messages Map" }} />
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your location"
          />
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={100}
            fillColor="rgba(63, 81, 181, 0.2)"
            strokeColor="rgba(63, 81, 181, 0.5)"
          />
          {messages.map((message) => (
            <Marker
              key={message._id}
              coordinate={{
                latitude: message.location.coordinates[1],
                longitude: message.location.coordinates[0],
              }}
              title={message.username}
              description={message.content}
            />
          ))}
        </MapView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
}); 