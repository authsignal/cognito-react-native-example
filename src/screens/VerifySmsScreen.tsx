import React, {useEffect, useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';
import {useAppContext} from '../context';
import {respondToAuthChallenge} from '../cognito';
import {verifyAuthenticator} from '../api';

export function VerifySmsScreen({navigation, route}: any) {
  const {setUserAttributes} = useAppContext();

  const [code, setCode] = useState('');

  const {username, phoneNumber, session} = route.params;

  useEffect(() => {
    authsignal.sms.challenge();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Confirm your number</Text>
      <Text style={styles.text}>Enter the code sent to {phoneNumber}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        onChangeText={setCode}
        value={code}
        autoFocus={true}
        keyboardType={'number-pad'}
      />
      <Button
        onPress={async () => {
          try {
            const {data, error} = await authsignal.sms.verify({code});

            if (error || !data?.token) {
              Alert.alert('Invalid code', 'Reason: ' + data?.failureReason);
            } else {
              if (session) {
                console.log('Responding to Cognito challenge', {session, username, answer: data.token});

                // If a Cognito session is present we're signing the user in via SMS
                // In this case we need to respond to the Cognito challenge
                await respondToAuthChallenge({session, username, answer: data.token});
              } else {
                // Otherwise the user has already signed in via email, Apple, or Google
                // In this case we need to finish verifying the new SMS authenticator
                await verifyAuthenticator(data.token);
              }

              const {emailVerified, givenName, familyName} = await setUserAttributes();

              if (!emailVerified) {
                navigation.navigate('EnrollEmail');
              } else if (!givenName || !familyName) {
                navigation.navigate('Name');
              }
            }
          } catch (err) {
            if (err instanceof Error) {
              Alert.alert('Error', err.message);
            }
          }
        }}>
        Confirm
      </Button>
      <View style={styles.center}>
        <Text>Didn't receive a code?</Text>
        <TouchableOpacity
          onPress={async () => {
            setCode('');

            await authsignal.sms.challenge();

            Alert.alert('Verification code re-sent');
          }}>
          <Text style={styles.link}>Re-send it</Text>
        </TouchableOpacity>
      </View>
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
  text: {
    marginHorizontal: 20,
  },
  link: {
    color: '#525EEA',
    marginLeft: 5,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  center: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
});
