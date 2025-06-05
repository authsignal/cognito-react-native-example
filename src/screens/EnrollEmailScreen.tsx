import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from '../components/Button';

export function EnrollEmailScreen({navigation, route}: any) {
  const [email, setEmail] = useState('');

  const {username} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>What's your email?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        onChangeText={setEmail}
        value={email}
        autoFocus={true}
        textContentType={'emailAddress'}
        autoCapitalize={'none'}
        autoCorrect={false}
      />
      <Button
        disabled={email.length === 0}
        onPress={async () => {
          try {
            navigation.navigate('VerifyEmail', {username, email});
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
