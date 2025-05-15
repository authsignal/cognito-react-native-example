import React, {useState} from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

interface Props {
  children: any;
  disabled?: boolean;
  theme?: 'primary' | 'secondary';
  onPress: () => Promise<void> | void;
}

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
        <ActivityIndicator color={theme === 'primary' ? 'white' : 'black'} />
      ) : (
        <Text style={[styles.text, theme === 'primary' ? styles.textPrimary : styles.textSecondary]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

interface SocialLoginButtonProps {
  type: 'google' | 'apple';
  onPress: () => Promise<void> | void;
}

export const SocialLoginButton = ({type, onPress}: SocialLoginButtonProps) => {
  const [loading, setLoading] = useState(false);

  function getImageSource() {
    switch (type) {
      case 'google':
        return require('../../images/google-icon.png');
      case 'apple':
        return require('../../images/apple-icon.png');
      default:
        throw new Error('Invalid button type');
    }
  }

  function getText() {
    switch (type) {
      case 'google':
        return 'Continue with Google';
      case 'apple':
        return 'Continue with Apple';
      default:
        throw new Error('Invalid button type');
    }
  }

  return (
    <TouchableOpacity
      style={[styles.background, styles.backgroundSecondary]}
      disabled={loading}
      onPress={async () => {
        setLoading(true);

        await onPress();

        setLoading(false);
      }}>
      {loading ? (
        <ActivityIndicator color={'black'} />
      ) : (
        <View style={styles.row}>
          <Image style={styles.icon} resizeMode={'contain'} source={getImageSource()} />
          <Text style={[styles.text, styles.textSecondary]}>{getText()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  background: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    marginBottom: 12,
    marginHorizontal: 20,
    borderRadius: 6,
    elevation: 3,
  },
  backgroundPrimary: {
    backgroundColor: 'black',
  },
  backgroundSecondary: {
    backgroundColor: '#E8E8E8',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
  textPrimary: {
    color: 'white',
  },
  textSecondary: {
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
});
