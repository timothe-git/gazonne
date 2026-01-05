import React, { useContext, useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authContext } from '@/utils/AuthContext';
import { Link } from 'expo-router';


const Login: React.FC = () => {
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <Button title="Login" onPress={() => authState.logIn(email, password)} />
      <ThemedText>Besoin de créer un compte ? <Link replace href='/register'>cliquez ici</Link></ThemedText>
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
  mainBtn: {
    width: 200,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  btnGreen: {
    backgroundColor: "#0BCD4C",
  },
  btnYellow: {
    backgroundColor: "yellow",
  },
  mainText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});

export default Login;