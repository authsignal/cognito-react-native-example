import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from './Button';
import {authsignal} from './authsignal';
import {signUp, initiateAuth} from './cognito';

export function SignInSmsScreen({navigation}: any) {
  const [phoneNumber, setPhoneNumber] = useState('+64');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Lets get started</Text>
      <Text style={styles.text}>Enter your mobile number and we'll send you a code.</Text>
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
          const username = phoneNumber;

          // Sign up user in Cognito
          // If they already exist then ignore error and continue
          try {
            await signUp({username, phoneNumber});
          } catch (ex) {
            if (ex instanceof Error && ex.name !== 'UsernameExistsException') {
              return Alert.alert('Error', ex.message);
            }
          }

          // Start custom auth sign-in flow
          // This will invoke the Create Auth Challenge lambda
          try {
            const {session, token, isEnrolled} = await initiateAuth(username);

            if (!token) {
              throw new Error('No Authsignal token returned from Create Auth Challenge lambda');
            }

            await authsignal.setToken(token);

            navigation.navigate('VerifySms', {phoneNumber, isEnrolled, session});
          } catch (err) {
            if (err instanceof Error) {
              Alert.alert('Invalid credentials', err.message);
            }
          }
        }}>
        Send verification code
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  text: {
    marginHorizontal: 20,
  },
});
