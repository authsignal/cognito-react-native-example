import React, {useEffect, useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';
import {useAppContext} from '../context';
import {handleCognitoAuth} from '../cognito';

export function VerifyEmailScreen({route}: any) {
  const {setUserAttributes} = useAppContext();

  const [code, setCode] = useState('');

  const {username, email} = route.params;

  useEffect(() => {
    if (email) {
      authsignal.email.enroll({email});
    }
  }, [email]);

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
          const {data, error} = await authsignal.email.verify({code});

          if (error || !data?.token) {
            Alert.alert('Invalid code');
          } else {
            try {
              await handleCognitoAuth({username, token: data.token});

              await setUserAttributes();
            } catch (ex) {
              if (ex instanceof Error) {
                return Alert.alert('Error', ex.message);
              }
            }
          }
        }}>
        Confirm
      </Button>
      <View style={styles.center}>
        <Text>Didn't receive a code?</Text>
        <TouchableOpacity
          onPress={async () => {
            setCode('');

            await authsignal.email.enroll({email});

            Alert.alert('Verification code re-sent');
          }}>
          <Text style={styles.link}>Re-send it</Text>
        </TouchableOpacity>
      </View>
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
  link: {
    color: '#525EEA',
    marginLeft: 5,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  center: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
});
