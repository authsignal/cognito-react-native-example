import React from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';

export function DeviceChallengeScreen({navigation}: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Authorize request</Text>

      <Button
        onPress={async () => {
          const challengeId = '';

          await authsignal.push.updateChallenge({challengeId, approved: true});

          navigation.goBack();
        }}>
        Authorize
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
  text: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
});
