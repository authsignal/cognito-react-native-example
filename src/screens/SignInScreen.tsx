import React, {useEffect, useState} from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button, SocialLoginButton} from '../components/Button';
import {authsignal} from '../authsignal';
import {initiateSmsAuth, handleTokenAuth} from '../cognito';
import {startSignIn} from '../api';
import {useAppContext} from '../context';
import {signInWithApple} from '../apple';
import {signInWithGoogle} from '../google';

export function SignInScreen({navigation}: any) {
  const {setUserAttributes} = useAppContext();

  const [phoneNumber, setPhoneNumber] = useState('+64');

  // Show sign-in with passkey prompt if credential available
  useEffect(() => {
    async function signInWithPasskey() {
      const {data, errorCode} = await authsignal.passkey.signIn({action: 'cognitoAuth'});

      if (errorCode === 'user_canceled' || errorCode === 'no_credential' || !data) {
        return;
      }

      try {
        const {username, token} = data;

        await handleTokenAuth({username, token, signInMethod: 'PASSKEY'});

        await setUserAttributes();
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert('Error', error.message);
        }
      }
    }

    signInWithPasskey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressContinue = async () => {
    try {
      const {username} = await startSignIn({phoneNumber});

      if (!username) {
        throw new Error('startSignIn error');
      }

      const {session, token, phoneNumberVerified} = await initiateSmsAuth(username);

      if (!token) {
        throw new Error('No Authsignal token returned from Create Auth Challenge lambda');
      }

      await authsignal.setToken(token);

      // If this is the first timing signing in with SMS, we need to capture & verify additional attributes
      navigation.navigate('SignInModal', {username, phoneNumber, phoneNumberVerified, session});
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Invalid credentials', err.message);
      }
    }
  };

  const onPressContinueWithGoogle = async () => {
    try {
      const {idToken} = await signInWithGoogle();

      const {username} = await startSignIn({idToken});

      if (!username) {
        throw new Error('startSignIn error');
      }

      await handleTokenAuth({username, token: idToken, signInMethod: 'GOOGLE'});

      const {phoneNumberVerified, givenName, familyName} = await setUserAttributes();

      // If this is the first time signing in with Google, we need to capture & verify additional attributes
      if (!phoneNumberVerified || !givenName || !familyName) {
        navigation.navigate('SignInModal', {username, phoneNumberVerified, givenName, familyName});
      }
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
    }
  };

  const onPressContinueWithApple = async () => {
    try {
      const {identityToken: idToken} = await signInWithApple();

      const {username} = await startSignIn({idToken});

      if (!username) {
        throw new Error('startSignIn error');
      }

      await handleTokenAuth({username, token: idToken, signInMethod: 'APPLE'});

      const {phoneNumberVerified, givenName, familyName} = await setUserAttributes();

      // If this is the first time signing in with Apple, we need to capture & verify additional attributes
      if (!phoneNumberVerified || !givenName || !familyName) {
        navigation.navigate('SignInModal', {username, phoneNumberVerified, givenName, familyName});
      }
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../images/simplify.png')} resizeMode={'contain'} style={styles.logo} />
      <Text style={styles.header}>Get started with Simplify</Text>
      <Text style={styles.text}>Mobile number</Text>
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
      <Button onPress={onPressContinue}>Continue</Button>
      <Text style={styles.or}>OR</Text>
      <SocialLoginButton type="google" onPress={onPressContinueWithGoogle} />
      <SocialLoginButton type="apple" onPress={onPressContinueWithApple} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 28,
    marginHorizontal: 20,
  },
  text: {
    alignSelf: 'flex-start',
    marginHorizontal: 20,
  },
  logo: {
    width: '100%',
  },
  or: {
    marginBottom: 12,
  },
});
