import React from 'react';
import {Alert, SafeAreaView, StyleSheet, Text} from 'react-native';

import {Button} from './Button';
import {authsignal} from './authsignal';
import {getUserAttributes} from './cognito';
import {addAuthenticator} from './api';

export function CreatePasskeyScreen({navigation}: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Create a passkey</Text>
      <Text style={styles.text}>Passkeys are a simple and secure way to sign in.</Text>

      <Button
        onPress={async () => {
          const userAttributes = await getUserAttributes();

          const {givenName, familyName, username} = userAttributes;

          const authsignalToken = await addAuthenticator();

          await authsignal.setToken(authsignalToken);

          const {error} = await authsignal.passkey.signUp({
            username,
            displayName: `${givenName} ${familyName}`,
          });

          if (!error) {
            Alert.alert('Passkey created.', 'You can now use your passkey to sign in.', [
              {text: 'OK', onPress: () => navigation.goBack()},
            ]);
          } else {
            Alert.alert('Error creating passkey', error);
          }
        }}>
        Create passkey
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  text: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
});
