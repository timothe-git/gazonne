import React, { useContext, useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authContext } from '@/utils/AuthContext';
import { Link } from 'expo-router';


const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const authState = useContext(authContext);

  return (
    <ThemedView style={styles.container}>
      {authState.error ? (
              <ThemedText>{authState.error}</ThemedText>
            ) : (<ThemedText>no error</ThemedText>)}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={() => authState.register(email, password)}/>
      <ThemedText>Vous avez déjà un compte ? <Link replace href='/login'>Cliquez ici</Link></ThemedText>
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