import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from '../components/Button';
import {startSignIn} from '../api';
import {authsignal} from '../authsignal';
import {initiateEmailAuth} from '../cognito';

export function SignInWithEmailScreen({navigation}: any) {
  const [email, setEmail] = useState('');

  const onPressContinue = async () => {
    try {
      const {username} = await startSignIn({email});

      if (!username) {
        throw new Error('startSignIn error');
      }

      const {session, token, emailVerified} = await initiateEmailAuth(username);

      await authsignal.setToken(token);

      navigation.navigate('VerifyEmail', {username, email, emailVerified, session});
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Invalid credentials', err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Sign in with email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        onChangeText={setEmail}
        value={email}
        autoFocus={true}
        textContentType={'emailAddress'}
        autoCapitalize={'none'}
      />
      <Button disabled={email.length === 0} onPress={onPressContinue}>
        Continue
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  input: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    height: 46,
    borderRadius: 6,
    padding: 10,
  },
});
