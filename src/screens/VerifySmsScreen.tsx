import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from '../components/Button';
import {verifySmsChallenge} from '../api';
import {setAccessToken} from '../cognito';
import {useAppContext} from '../context';

export function VerifySmsScreen({navigation, route}: any) {
  const {setUserAttributes} = useAppContext();

  const [code, setCode] = useState('');

  const {phoneNumber, challengeId} = route.params;

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
            const {isVerified, accessToken} = await verifySmsChallenge({
              challengeId,
              verificationCode: code,
            });

            if (!isVerified) {
              return Alert.alert('Invalid code');
            }

            // If access token is present, email must already be verified
            if (accessToken) {
              await setAccessToken(accessToken);

              await setUserAttributes();
            } else {
              navigation.navigate('EnrollEmail', {smsChallengeId: challengeId});
            }
          } catch (err) {
            if (err instanceof Error) {
              Alert.alert('Error', err.message);
            }
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
