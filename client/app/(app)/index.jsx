import React, { useState, useContext } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Button, Input, Text, Card, Icon } from '@rneui/themed';
import { Stack } from 'expo-router';
import { LocationContext } from '../../src/context/LocationContext';
import { AuthContext } from '../../src/context/AuthContext';
import { createMessage, deleteMessage } from '../../src/api/messages';

export default function MessagesScreen() {
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { location, messages, isLoading, addMessage, removeMessage } = useContext(LocationContext);
  const { userToken, userInfo } = useContext(AuthContext);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !location || !userToken) {
      return;
    }

    try {
      setLoading(true);
      const response = await createMessage(
        newMessage.trim(),
        location.latitude,
        location.longitude,
        userToken
      );
      
      addMessage(response);
      setNewMessage('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await deleteMessage(id, userToken);
      removeMessage(id);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDeleteMessage(id), style: 'destructive' }
      ]
    );
  };

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text h4>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>Nearby Messages</Text>
      </View>

      {isLoading && messages.length === 0 ? (
        <View style={styles.centered}>
          <Text>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centered}>
          <Text>No messages nearby. Be the first to post!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card containerStyle={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <Card.Divider />
              <Text style={styles.messageContent}>{item.content}</Text>
              {userInfo && item.user === userInfo._id && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item._id)}
                >
                  <Icon name="delete" color="red" size={20} />
                </TouchableOpacity>
              )}
            </Card>
          )}
        />
      )}

      <View style={styles.inputContainer}>
        <Input
          placeholder="Write your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          containerStyle={styles.input}
          inputContainerStyle={{ borderBottomWidth: 0 }}
        />
        <Button
          icon={{ name: 'send', color: 'white' }}
          disabled={!newMessage.trim()}
          loading={loading}
          onPress={handleSendMessage}
          buttonStyle={styles.sendButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageCard: {
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#3f51b5',
    borderRadius: 25,
    width: 50,
    height: 50,
  },
}); 