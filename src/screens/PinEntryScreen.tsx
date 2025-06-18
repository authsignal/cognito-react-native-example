import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';
import * as Keychain from 'react-native-keychain';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';
import {transferFunds} from '../api';

export function PinEntryScreen({navigation}: any) {
  const [pin, setPin] = useState('');

  const onPressEnterPin = async () => {
    const pinCredentials = await Keychain.getGenericPassword({service: '@simplify'});

    if (pinCredentials && pinCredentials.password !== pin) {
      return Alert.alert('Invalid PIN');
    }

    const {data, error} = await authsignal.device.verify();

    if (data?.token) {
      // The user successfully authenticated with their device credential
      // Now we can proceed with the transfer
      await signTransaction(data.token);
    } else {
      Alert.alert('Error transferring funds.', error);
    }
  };

  const signTransaction = async (token: string) => {
    const {transferCompleted} = await transferFunds({token});

    if (transferCompleted) {
      // No step-up auth is required
      Alert.alert('Transfer successful.', undefined, [{text: 'OK', onPress: () => navigation.goBack()}]);
    } else {
      Alert.alert('Error transferring funds.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Enter PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your 6 digit PIN"
        onChangeText={setPin}
        value={pin}
        autoFocus={true}
        keyboardType={'number-pad'}
        maxLength={6}
        secureTextEntry={true}
      />
      <Button disabled={pin.length !== 6} onPress={onPressEnterPin}>
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
