import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';
import * as Keychain from 'react-native-keychain';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';
import {addAuthenticator} from '../api';

export function CreatePinScreen({navigation}: any) {
  const [pin, setPin] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Create a PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a 6 digit PIN"
        onChangeText={setPin}
        value={pin}
        autoFocus={true}
        keyboardType={'number-pad'}
        maxLength={6}
      />
      <Button
        disabled={pin.length !== 6}
        onPress={async () => {
          await addAuthenticator();

          await Keychain.setGenericPassword('@simplify_user_pin', pin);

          console.log('PIN saved to Keychain.');

          const {error} = await authsignal.push.addCredential();

          if (error) {
            Alert.alert('Error adding push credential', error);
          } else {
            console.log('Device credential added.');

            navigation.goBack();

            setTimeout(() => {
              navigation.goBack();
            }, 100);
          }
        }}>
        Confirm
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
  image: {
    width: 100,
    height: 100,
    marginLeft: 10,
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
