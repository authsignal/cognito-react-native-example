import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from '../components/Button';
import {addAuthenticator} from '../api';

export function EnrollSmsScreen({navigation}: any) {
  const [phoneNumber, setPhoneNumber] = useState('+64');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>What's your phone number?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        autoFocus={true}
        textContentType={'telephoneNumber'}
        autoCapitalize={'none'}
      />
      <Button
        disabled={phoneNumber.length === 0}
        onPress={async () => {
          try {
            await addAuthenticator({phoneNumber});

            navigation.navigate('VerifySms', {phoneNumber});
          } catch (ex) {
            if (ex instanceof Error) {
              return Alert.alert('Error', ex.message);
            }
          }
        }}>
        Continue
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
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
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
});
