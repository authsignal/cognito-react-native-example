import React, {useEffect, useState} from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';
import {initEmailSignIn, signIn} from '../api';
import {useAppContext} from '../context';

export function SignInScreen({navigation}: any) {
  const {setAuthenticated} = useAppContext();

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('chris@authsignal.com');

  async function signInWithPasskey() {
    const {data, errorCode} = await authsignal.passkey.signIn({action: 'signIn'});

    if (errorCode === 'user_canceled' || errorCode === 'no_credential' || !data?.token) {
      return;
    }

    setLoading(true);

    try {
      const {accessToken} = await signIn(data.token);

      await AsyncStorage.setItem('@access_token', accessToken);

      await setAuthenticated(true);
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
      await initEmailSignIn(email);

      navigation.navigate('SignInModal', {email});
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Invalid credentials', err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../images/simplify.png')} resizeMode={'contain'} style={styles.logo} />
      <Text style={styles.header}>Get started with Simplify</Text>
      <Text style={styles.text}>Email</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          onChangeText={setEmail}
          value={email}
          autoCapitalize={'none'}
          autoCorrect={false}
          autoFocus={true}
          textContentType={'emailAddress'}
        />
        <TouchableOpacity onPress={signInWithPasskey}>
          <Image style={styles.passkeyIcon} resizeMode={'contain'} source={require('../../images/passkey-icon.png')} />
        </TouchableOpacity>
      </View>
      <Button loading={loading} onPress={onPressContinue}>
        Continue
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
  passkeyIcon: {
    position: 'absolute',
    width: 20,
    height: 20,
    margin: 12,
    right: 0,
    bottom: 0,
  },
});
