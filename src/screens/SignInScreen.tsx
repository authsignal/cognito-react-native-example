import React, {useEffect, useState} from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';
import {initiateSmsAuth, handleTokenAuth} from '../cognito';
import {startSignIn} from '../api';
import {useAppContext} from '../context';
import {signInWithApple} from '../apple';
import {signInWithGoogle} from '../google';

export function SignInScreen({navigation}: any) {
  const {setUserAttributes} = useAppContext();

  const [loading, setLoading] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('+64');

  async function signInWithPasskey() {
    const {data, errorCode} = await authsignal.passkey.signIn({action: 'cognitoAuth'});

    if (errorCode === 'user_canceled' || errorCode === 'no_credential' || !data) {
      return;
    }

    setLoading(true);

    try {
      const {username, token} = data;

      await handleTokenAuth({username, token, signInMethod: 'PASSKEY'});

      await setUserAttributes();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Show passkey sign-in prompt when screen 1st appears if credential available
  useEffect(() => {
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

      await authsignal.setToken(token);

      // If this is the first timing signing in with SMS, we need to capture & verify additional attributes
      navigation.navigate('SignInModal', {username, phoneNumber, phoneNumberVerified, session});
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Invalid credentials', err.message);
      }
    }
  };

  const onPressContinueWithApple = async () => {
    try {
      const {idToken} = await signInWithApple();

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

  const onPressContinueWithEmail = async () => {
    navigation.navigate('SignInModal', {initialRoute: 'SignInWithEmail'});
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../images/simplify.png')} resizeMode={'contain'} style={styles.logo} />
      <Text style={styles.header}>Get started with Simplify</Text>
      <Text style={styles.text}>Mobile number</Text>
      <View style={styles.inputContainer}>
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
        <TouchableOpacity onPress={signInWithPasskey}>
          <Image style={styles.passkeyIcon} resizeMode={'contain'} source={require('../../images/passkey-icon.png')} />
        </TouchableOpacity>
      </View>
      <Button loading={loading} onPress={onPressContinue}>
        Continue
      </Button>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.or}>or</Text>
        <View style={styles.divider} />
      </View>
      <Button theme="secondary" image={require('../../images/apple-icon.png')} onPress={onPressContinueWithApple}>
        Continue with Apple
      </Button>
      <Button theme="secondary" image={require('../../images/google-icon.png')} onPress={onPressContinueWithGoogle}>
        Continue with Google
      </Button>
      <Button theme="secondary" icon="envelope" onPress={onPressContinueWithEmail}>
        Continue with email
      </Button>
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
  inputContainer: {
    alignSelf: 'stretch',
    height: 46,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    flex: 1,
  },
  or: {
    paddingHorizontal: 10,
    color: '#A8A8A8',
  },
  passkeyIcon: {
    position: 'absolute',
    width: 20,
    height: 20,
    margin: 12,
    right: 0,
    bottom: 0,
  },
});
