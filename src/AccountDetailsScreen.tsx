import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from './Button';
import {useAppContext} from './context';
import {completeRegistration} from './cognito';

export function AccountDetailsScreen() {
  const {setHasCompletedRegistration} = useAppContext();

  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [birthdate, setBirthdate] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>What's your name and birthday?</Text>
      <TextInput
        style={styles.input}
        placeholder="First name"
        onChangeText={setGivenName}
        value={givenName}
        autoFocus={true}
      />
      <TextInput style={styles.input} placeholder="Surname" onChangeText={setFamilyName} value={familyName} />
      <TextInput style={styles.input} placeholder="Birthday (optional)" onChangeText={setBirthdate} value={birthdate} />
      <Button
        disabled={givenName.length === 0 || familyName.length === 0}
        onPress={async () => {
          try {
            const completeRegistrationInput = {
              givenName,
              familyName,
              birthdate,
            };

            await completeRegistration(completeRegistrationInput);

            setHasCompletedRegistration(true);
          } catch (ex) {
            if (ex instanceof Error) {
              return Alert.alert('Error', ex.message);
            }
          }
        }}>
        Confirm
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
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  input: {
    alignSelf: 'stretch',
    height: 50,
    borderColor: 'black',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
