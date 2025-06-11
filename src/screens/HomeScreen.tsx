import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {authsignal} from '../authsignal';
import {Button} from '../components/Button';

export function HomeScreen({navigation}: any) {
  // Prompt to create passkey
  useEffect(() => {
    (async () => {
      const [isPasskeyAvailable, deviceCredentialResponse] = await Promise.all([
        authsignal.passkey.isAvailableOnDevice(),
        authsignal.push.getCredential(),
      ]);

      const deviceCredential = deviceCredentialResponse.data;

      console.log('isPasskeyAvailable:', isPasskeyAvailable);
      console.log('deviceCredential:', deviceCredential);

      if (!isPasskeyAvailable && !deviceCredential) {
        navigation.navigate('CreatePasskey');
      }
    })();
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button onPress={async () => navigation.navigate('DeviceChallenge')}>Authorize request</Button>
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
