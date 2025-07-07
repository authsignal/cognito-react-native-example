import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';

import {authsignal} from '../authsignal';
import {getUserAuthenticators, getUserProfile} from '../api';
import {useAppContext} from '../context';

export function HomeScreen({navigation}: any) {
  const {setEmail} = useAppContext();

  // Prompt to create passkey
  useEffect(() => {
    (async () => {
      const isPasskeyAvailable = await authsignal.passkey.isAvailableOnDevice();

      if (!isPasskeyAvailable) {
        navigation.navigate('CreatePasskey');
      }
    })();
  }, [navigation]);

  useEffect(() => {
    (async () => {
      const userProfile = await getUserProfile();

      setEmail(userProfile.email);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const userAuthenticators = await getUserAuthenticators();

      console.log('User Authenticators:', userAuthenticators);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Home</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
  },
});
