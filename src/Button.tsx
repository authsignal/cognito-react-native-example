import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native';

interface Props {
  children: any;
  disabled?: boolean;
  theme?: 'primary' | 'secondary';
  onPress: () => Promise<void> | void;
}

const blue = '#525EEA';

export const Button = ({children, disabled, theme = 'primary', onPress}: Props) => {
  const [loading, setLoading] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.background, theme === 'primary' ? styles.backgroundPrimary : styles.backgroundSecondary]}
      disabled={disabled ?? loading}
      onPress={async () => {
        setLoading(true);

        await onPress();

        setLoading(false);
      }}>
      {loading ? (
        <ActivityIndicator color={theme === 'primary' ? 'white' : blue} />
      ) : (
        <Text style={[styles.text, theme === 'primary' ? styles.textPrimary : styles.textSecondary]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  background: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 6,
    elevation: 3,
  },
  backgroundPrimary: {
    backgroundColor: blue,
  },
  backgroundSecondary: {
    backgroundColor: '#F5FCFF',
    borderColor: blue,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
    fontWeight: '500',
  },
  textPrimary: {
    color: 'white',
  },
  textSecondary: {
    color: '#525EEA',
  },
});
