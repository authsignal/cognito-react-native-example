import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

import {HomeScreen} from './HomeScreen';
import {SignInScreen} from './SignInScreen';
import {SignInSmsScreen} from './SignInSmsScreen';
import {VerifySmsScreen} from './VerifySmsScreen';
import {AuthContext, useAuthContext} from './context';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';

const Stack = createStackNavigator();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@access_token')
      .then(accessToken => {
        setIsSignedIn(!!accessToken);
      })
      .catch(() => {})
      .finally(() => setInitialized(true));
  }, []);

  const authContext = useMemo(
    () => ({
      isSignedIn,
      setIsSignedIn,
    }),
    [isSignedIn],
  );

  if (!initialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{animationEnabled: false, headerShown: false}}>
          {isSignedIn ? (
            <Stack.Screen name="SignedIn" component={SignedInStack} />
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Group
                screenOptions={{
                  animationEnabled: true,
                  headerShown: true,
                  presentation: 'modal',
                }}>
                <Stack.Screen name="SignInSmsStack" component={SignInSmsStack} options={{headerShown: false}} />
              </Stack.Group>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export default App;

function SignedInStack() {
  const {setIsSignedIn} = useAuthContext();

  const onSignOutPressed = async () => {
    await AsyncStorage.removeItem('@access_token');

    setIsSignedIn(false);
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => (
            <Image style={styles.headerTitle} resizeMode={'contain'} source={require('../images/simplify.png')} />
          ),
          // eslint-disable-next-line react/no-unstable-nested-components
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerRight}
              onPress={async () => {
                const accessToken = await AsyncStorage.getItem('@access_token');

                if (!accessToken) {
                  return;
                }

                Alert.alert('Current access token', accessToken, [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {},
                  },
                  {text: 'Sign out', onPress: onSignOutPressed},
                ]);
              }}>
              <Icon name="user" size={18} color="#525eea" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function SignInSmsStack() {
  return (
    <Stack.Navigator screenOptions={{headerBackTitleVisible: false}}>
      <Stack.Screen
        name="SignInSms"
        component={SignInSmsScreen}
        options={{
          title: 'Sign in with SMS',
        }}
      />
      <Stack.Screen
        name="VerifySms"
        component={VerifySmsScreen}
        options={{
          title: 'Verify SMS',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    width: 250,
  },
  headerRight: {
    marginRight: 20,
  },
});
