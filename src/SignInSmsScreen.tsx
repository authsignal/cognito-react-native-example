import {AuthFlowType, InitiateAuthCommand, SignUpCommand} from '@aws-sdk/client-cognito-identity-provider';
import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, TextInput} from 'react-native';
import {sha256} from 'react-native-sha256';

import {Button} from './Button';
import {authsignal, cognito, cognitoUserPoolClientId} from './config';

export function SignInSmsScreen({navigation}: any) {
  const [phoneNumber, setPhoneNumber] = useState('+64');

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        autoCapitalize={'none'}
        autoCorrect={false}
        autoFocus={true}
        textContentType={'telephoneNumber'}
      />
      <Button
        onPress={async () => {
          const username = await sha256(phoneNumber);

          // Create user in Cognito
          // If they already exist then ignore error and continue
          try {
            const signUpCommand = new SignUpCommand({
              ClientId: cognitoUserPoolClientId,
              Username: username,
              Password: Math.random().toString(36).slice(-16) + 'X', // Dummy value - never used
              UserAttributes: [
                {
                  Name: 'phone_number',
                  Value: phoneNumber,
                },
              ],
            });

            await cognito.send(signUpCommand);
          } catch (ex) {
            if (ex instanceof Error && ex.name !== 'UsernameExistsException') {
              throw ex;
            }
          }

          // Start custom auth sign-in flow
          // This will invoke the Create Auth Challenge lambda
          try {
            const initiateAuthCommand = new InitiateAuthCommand({
              ClientId: cognitoUserPoolClientId,
              AuthFlow: AuthFlowType.CUSTOM_AUTH,
              AuthParameters: {
                USERNAME: username,
              },
            });

            const output = await cognito.send(initiateAuthCommand);

            const token = output.ChallengeParameters!.token;
            const isEnrolled = output.ChallengeParameters!.isEnrolled === 'true';
            const session = output.Session;

            await authsignal.setToken(token);

            navigation.navigate('VerifySms', {phoneNumber, isEnrolled, session});
          } catch (err) {
            if (err instanceof Error) {
              Alert.alert('Invalid credentials', err.message);
            }
          }
        }}>
        Sign in
      </Button>
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
});
