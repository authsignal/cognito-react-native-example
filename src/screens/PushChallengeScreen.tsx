import React from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';

export function PushChallengeScreen({navigation, route}: any) {
  const {challengeId} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Authorize request</Text>
      <Text style={styles.text}>Your approval is required to authorize a sign-in request.</Text>

      <Button
        onPress={async () => {
          await authsignal.push.updateChallenge({challengeId, approved: true});

          navigation.goBack();
        }}>
        Approve
      </Button>
      <Button
        theme="secondary"
        onPress={async () => {
          await authsignal.push.updateChallenge({challengeId, approved: true});

          navigation.goBack();
        }}>
        Deny
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
  text: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
});
