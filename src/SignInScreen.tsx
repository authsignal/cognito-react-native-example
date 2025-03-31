import React from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, View} from 'react-native';
import {ErrorCode} from 'react-native-authsignal';

import {Button} from './Button';
import {authsignal} from './authsignal';
import {useAppContext} from './context';
import {getUserAttributes, initiateAuth, respondToAuthChallenge} from './cognito';

export function SignInScreen({navigation}: any) {
  const {setIsSignedIn, setHasCompletedRegistration} = useAppContext();

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

            if (!data || !data.token || !data.username) {
              return;
            }

            const {username} = data;

            console.log('username', username);

            try {
              const {session} = await initiateAuth(username);

              await respondToAuthChallenge({session, username, answer: data.token});

              const {hasCompletedRegistration} = await getUserAttributes();

              setHasCompletedRegistration(hasCompletedRegistration);

              setIsSignedIn(true);
            } catch (error) {
              if (error instanceof Error) {
                Alert.alert('Error', error.message);
              }
            }
          }}>
          Continue
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
