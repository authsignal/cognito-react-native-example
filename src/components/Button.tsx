import React, {useState} from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  children: any;
  loading?: boolean;
  disabled?: boolean;
  theme?: 'primary' | 'secondary';
  image?: any;
  icon?: string;
  onPress: () => Promise<void> | void;
}

export const Button = (props: Props) => {
  const {children, disabled, theme = 'primary', image, icon, onPress} = props;

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
      {props.loading || loading ? (
        <ActivityIndicator color={theme === 'primary' ? 'white' : 'black'} />
      ) : (
        <View style={styles.row}>
          {image && <Image style={styles.image} resizeMode={'contain'} source={image} />}
          {icon && <Icon style={styles.icon} name={icon} size={16} color={theme === 'primary' ? 'white' : 'black'} />}
          <Text style={[styles.text, theme === 'primary' ? styles.textPrimary : styles.textSecondary]}>{children}</Text>
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
  image: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },
});
