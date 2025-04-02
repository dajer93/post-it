import React, { useState, useContext } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button, Input, Text, Avatar, Card } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../src/context/AuthContext';
import { updateUserProfile, uploadProfilePicture } from '../../src/api/auth';

export default function ProfileScreen() {
  const { userInfo, userToken, logout, updateUser } = useContext(AuthContext);
  const [username, setUsername] = useState(userInfo?.username || '');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(userInfo?.profilePicture || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to select a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Upload the image directly when selected
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setIsUploadingImage(true);
      setError(null);
      
      // Call the new upload function
      const response = await uploadProfilePicture(imageUri, userToken);
      
      // Update user state with the S3 profile picture URL
      setProfilePicture(response.profilePicture);
      updateUser({
        ...userInfo,
        profilePicture: response.profilePicture
      });
      
      Alert.alert('Success', 'Profile picture uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create update object with only fields that changed
      const updateData = {};
      if (username !== userInfo.username) {
        updateData.username = username;
      }
      if (password) {
        updateData.password = password;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await updateUserProfile(updateData, userToken);
        updateUser(updatedUser);
        Alert.alert('Success', 'Profile updated successfully');
        setPassword(''); // Clear password field after update
      } else {
        Alert.alert('Info', 'No changes to update');
      }
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} disabled={isUploadingImage}>
            {isUploadingImage ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3f51b5" />
              </View>
            ) : (
              <Avatar
                size={100}
                rounded
                source={
                  profilePicture
                    ? { uri: profilePicture }
                    : require('../../src/assets/default-avatar.png')
                }
                containerStyle={styles.avatar}
              >
                <Avatar.Accessory size={24} />
              </Avatar>
            )}
          </TouchableOpacity>
          <Text style={styles.tapHint}>Tap to change profile picture</Text>
        </View>

        <Text h3 style={styles.username}>
          {userInfo?.username}
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          leftIcon={{ type: 'material', name: 'person' }}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="New Password (leave blank to keep current)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={{ type: 'material', name: 'lock' }}
          containerStyle={styles.inputContainer}
        />

        <Button
          title="Update Profile"
          loading={isLoading}
          onPress={handleUpdateProfile}
          buttonStyle={styles.updateButton}
          containerStyle={styles.buttonContainer}
        />

        <Button
          title="Logout"
          type="outline"
          onPress={handleLogout}
          buttonStyle={styles.logoutButton}
          containerStyle={styles.buttonContainer}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    backgroundColor: '#e0e0e0',
  },
  loadingContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  username: {
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  updateButton: {
    backgroundColor: '#3f51b5',
    borderRadius: 25,
    height: 50,
  },
  logoutButton: {
    borderColor: '#f44336',
    borderRadius: 25,
    height: 50,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
}); 