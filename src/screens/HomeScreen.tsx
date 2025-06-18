import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, TextInput} from 'react-native';

import {authsignal} from '../authsignal';
import {Button} from '../components/Button';
import {transferFunds} from '../api';

export function HomeScreen({navigation}: any) {
  const [amount, setAmount] = useState('100000');

  // Prompt to create passkey
  useEffect(() => {
    (async () => {
      const isPasskeyAvailable = await authsignal.passkey.isAvailableOnDevice();

      if (!isPasskeyAvailable) {
        navigation.navigate('CreatePasskey');
      }
    })();
  }, [navigation]);

  const onPressTransferFunds = async () => {
    const {transferCompleted, token} = await transferFunds({amount});

    if (transferCompleted) {
      // No step-up auth is required
      return Alert.alert('Transfer successful.');
    } else if (token) {
      // Step-up auth is required
      // Set the token to use Authsignal to sign the transaction
      await authsignal.setToken(token);
    }

    const {data} = await authsignal.passkey.signIn();

    if (data?.token) {
      // The user successfully authenticated with their passkey
      // Now we can proceed with the transfer
      await signTransaction(data.token);
    } else {
      // Either no passkey is available or the user canceled
      // iOS does not differentiate between these two cases so we have to treat them identically
      // We have to fall back to PIN entry in either case
      navigation.navigate('PinEntry');
    }
  };

  const signTransaction = async (token: string) => {
    const {transferCompleted} = await transferFunds({token});

    if (transferCompleted) {
      // No step-up auth is required
      return Alert.alert('Transfer successful.');
    } else {
      return Alert.alert('Error transferring funds.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput style={styles.input} placeholder="Enter amount" onChangeText={setAmount} value={amount} />
      <Button onPress={onPressTransferFunds}>Transfer funds</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  input: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
    height: 46,
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
});
