import React, { useContext, useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';
//import { useDispatch } from 'react-redux';


import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { authContext } from '@/utils/AuthContext';
import { Link } from 'expo-router';


const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showError, setShowError] = useState(false);
  
  const authState = useContext(authContext);

  return (
    <ThemedView style={styles.container}>
      {showError ? (
              <ThemedText>{message}</ThemedText>
            ) : (<ThemedText>no error</ThemedText>)}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" />
      <ThemedText>Already an account ? <Link replace href='/login'>Click here</Link></ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default Register;
