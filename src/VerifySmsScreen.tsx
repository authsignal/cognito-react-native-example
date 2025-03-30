import {ChallengeNameType, RespondToAuthChallengeCommand} from '@aws-sdk/client-cognito-identity-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity} from 'react-native';
import {sha256} from 'react-native-sha256';

import {Button} from './Button';
import {authsignal, cognito, cognitoUserPoolClientId} from './config';
import {useAuthContext} from './context';

export function VerifySmsScreen({route}: any) {
  const {setIsSignedIn} = useAuthContext();

  const [code, setCode] = useState('');

  const {phoneNumber, isEnrolled, session} = route.params;

  const sendSms = useCallback(async () => {
    if (isEnrolled) {
      await authsignal.sms.challenge();
    } else {
      await authsignal.sms.enroll({phoneNumber});
    }
  }, [phoneNumber, isEnrolled]);

  useEffect(() => {
    sendSms();
  }, [sendSms]);

  return (
    <SafeAreaView style={styles.container}>
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
          const {data, error} = await authsignal.sms.verify({code});

          if (error || !data?.token) {
            Alert.alert('Invalid code');
          } else {
            const username = await sha256(phoneNumber);

            const respondToAuthChallengeCommand = new RespondToAuthChallengeCommand({
              ClientId: cognitoUserPoolClientId,
              ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
              Session: session,
              ChallengeResponses: {
                USERNAME: username,
                ANSWER: data.token,
              },
            });

            const respondToAuthChallengeOutput = await cognito.send(respondToAuthChallengeCommand);

            const accessToken = respondToAuthChallengeOutput.AuthenticationResult?.AccessToken;

            if (!accessToken) {
              throw new Error('Cognito did not return an access token');
            }

            await AsyncStorage.setItem('@access_token', accessToken);

            setIsSignedIn(true);
          }
        }}>
        Verify
      </Button>
      <TouchableOpacity
        onPress={async () => {
          setCode('');

          await sendSms();

          Alert.alert('Verification code re-sent');
        }}>
        <Text style={styles.link}>Re-send code</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  input: {
    alignSelf: 'stretch',
    margin: 20,
    height: 50,
    borderColor: 'black',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
  },
  link: {
    color: '#525EEA',
    fontSize: 14,
  },
});
