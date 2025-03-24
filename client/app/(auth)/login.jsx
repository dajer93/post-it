import React, { useState, useContext } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { Link } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      return;
    }
    
    await login(username, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text h1 style={styles.title}>Post-it</Text>
          <Text h4 style={styles.subtitle}>Sign in to your account</Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={{ type: 'material', name: 'person' }}
            containerStyle={styles.inputContainer}
          />
          
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={{ type: 'material', name: 'lock' }}
            containerStyle={styles.inputContainer}
          />
          
          <Button
            title="Login"
            loading={isLoading}
            onPress={handleLogin}
            buttonStyle={styles.button}
            disabled={!username || !password}
          />
          
          <View style={styles.registerContainer}>
            <Text>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Button title="Register" type="clear" />
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#3f51b5',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#757575',
  },
  inputContainer: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#3f51b5',
    borderRadius: 25,
    height: 50,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
}); 