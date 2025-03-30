import {
  AuthFlowType,
  ChallengeNameType,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, View} from 'react-native';
import {ErrorCode} from 'react-native-authsignal';

import {Button} from './Button';
import {authsignal, cognito, cognitoUserPoolClientId} from './config';
import {useAuthContext} from './context';
import {sha256} from 'react-native-sha256';

export function SignInScreen({navigation}: any) {
  const {setIsSignedIn} = useAuthContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Image source={require('../images/simplify.png')} resizeMode={'contain'} style={styles.logo} />
        <Button
          onPress={async () => {
            const {data, errorCode} = await authsignal.passkey.signIn({
              action: 'cognitoAuth',
            });

            if (errorCode === ErrorCode.user_canceled || errorCode === ErrorCode.no_credential) {
              return navigation.navigate('SignInSmsStack');
            }

            try {
              if (data?.username && data?.token) {
                const username = await sha256(data.username);

                const initiateAuthCommand = new InitiateAuthCommand({
                  ClientId: cognitoUserPoolClientId,
                  AuthFlow: AuthFlowType.CUSTOM_AUTH,
                  AuthParameters: {
                    USERNAME: username,
                  },
                });

                const initiateAuthOutput = await cognito.send(initiateAuthCommand);

                if (!initiateAuthOutput.Session) {
                  throw new Error('Cognito could not start custom auth flow');
                }

                const respondToAuthChallengeCommand = new RespondToAuthChallengeCommand({
                  ClientId: cognitoUserPoolClientId,
                  ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
                  Session: initiateAuthOutput.Session,
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
            } catch (error) {
              if (error instanceof Error) {
                Alert.alert('Error', error.message);
              }
            }
          }}>
          Sign in
        </Button>
      </View>
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
  center: {
    width: '100%',
  },
  logo: {
    width: '100%',
  },
});
