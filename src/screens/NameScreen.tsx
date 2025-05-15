import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from '../components/Button';
import {useAppContext} from '../context';
import {updateNames} from '../cognito';

export function NameScreen() {
  const {setUserAttributes} = useAppContext();

  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>What's your first and last name?</Text>
      <TextInput style={styles.input} placeholder="First name" onChangeText={setGivenName} value={givenName} />
      <TextInput style={styles.input} placeholder="Last name" onChangeText={setFamilyName} value={familyName} />
      <Button
        disabled={givenName.length === 0 || familyName.length === 0}
        onPress={async () => {
          try {
            await updateNames(givenName, familyName);

            await setUserAttributes();
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
    backgroundColor: 'white',
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
