import React, {useEffect} from 'react';
import {Alert, ScrollView, StyleSheet, Text} from 'react-native';

import {authsignal} from '../authsignal';
import {getUserProfile} from '../api';
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
      try {
        const userProfile = await getUserProfile();

        setEmail(userProfile.email);
      } catch (error) {
        Alert.alert(
          'Error fetching user profile',
          error instanceof Error ? error.message : 'An unexpected error occurred',
        );
      }
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
