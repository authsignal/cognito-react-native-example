import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';

import {authsignal} from '../authsignal';

export function HomeScreen({navigation}: any) {
  // Prompt to create passkey
  useEffect(() => {
    (async () => {
      const isPasskeyAvailable = await authsignal.passkey.isAvailableOnDevice();

      if (!isPasskeyAvailable) {
        navigation.navigate('CreatePasskey');
      }
    })();
  }, [navigation]);

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
