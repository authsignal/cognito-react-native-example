import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from '../components/Button';
import {useAppContext} from '../context';
import {setAccessToken} from '../cognito';
import {verifyEmailChallenge} from '../api';

export function VerifyEmailScreen({route}: any) {
  const {setUserAttributes} = useAppContext();

  const [code, setCode] = useState('');

  const {email, smsChallengeId, emailChallengeId} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Confirm your email</Text>
      <Text style={styles.text}>Enter the code sent to {email}</Text>
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
          const {isVerified, accessToken} = await verifyEmailChallenge({
            smsChallengeId,
            emailChallengeId,
            emailVerificationCode: code,
          });

          console.log('isVerified', isVerified);
          console.log('accessToken', accessToken);

          if (!isVerified) {
            return Alert.alert('Invalid code');
          }

          if (accessToken) {
            await setAccessToken(accessToken);

            await setUserAttributes();
          } else {
            Alert.alert('Unexpected error');
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
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
});
