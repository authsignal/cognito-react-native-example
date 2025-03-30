import React, {useEffect} from 'react';
import {Alert, ScrollView, StyleSheet, Text} from 'react-native';

import {authsignal} from './config';

export function HomeScreen() {
  useEffect(() => {
    (async () => {
      const isPasskeyAvailable = await authsignal.passkey.isAvailableOnDevice();

      if (isPasskeyAvailable) {
        return;
      }

      const {error} = await authsignal.passkey.signUp();

      if (!error) {
        Alert.alert('Passkey created.');
      } else {
        Alert.alert('Error creating passkey', error);
      }
    })();
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
