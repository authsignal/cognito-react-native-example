import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import {CreatePasskeyScreen} from './screens/CreatePasskeyScreen';
import {HomeScreen} from './screens/HomeScreen';
import {SignInScreen} from './screens/SignInScreen';
import {VerifyEmailScreen} from './screens/VerifyEmailScreen';
import {AppContext} from './context';
import {getUserProfile} from './api';

const Stack = createStackNavigator();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const initUser = async () => {
      const accessToken = await AsyncStorage.getItem('@access_token');

      setAuthenticated(!!accessToken);

      console.log('Access token:', accessToken);

      const userProfile = await getUserProfile();

      setEmail(userProfile.email);

      setInitialized(true);
    };

    initUser();
  }, []);

  const appContext = useMemo(
    () => ({
      email,
      authenticated,
      setEmail,
      setAuthenticated,
    }),
    [authenticated, email, setEmail, setAuthenticated],
  );

  const onSignOutPressed = async () => {
    await AsyncStorage.removeItem('@access_token');

    setAuthenticated(false);
  };

  if (!initialized) {
    return null;
  }

  return (
    <AppContext.Provider value={appContext}>
      <NavigationContainer>
        {authenticated ? (
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                animation: 'fade',
                // eslint-disable-next-line react/no-unstable-nested-components
                headerTitle: () => (
                  <Image style={styles.headerTitle} resizeMode={'contain'} source={require('../images/simplify.png')} />
                ),
                // eslint-disable-next-line react/no-unstable-nested-components
                headerRight: () => (
                  <TouchableOpacity
                    style={styles.headerRight}
                    onPress={async () => {
                      Alert.alert('Do you want to sign out?', `The current signed-in user is ${email}`, [
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
            <Stack.Group screenOptions={{presentation: 'modal', headerShown: false}}>
              <Stack.Screen name="CreatePasskey" component={CreatePasskeyScreen} />
            </Stack.Group>
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignInModal" component={SignInModal} options={{presentation: 'modal'}} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;

function SignInModal({route}: any) {
  return (
    <Stack.Navigator screenOptions={{headerShown: true, title: '', headerBackTitle: 'Back'}}>
      <Stack.Group>
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} initialParams={route.params} />
      </Stack.Group>
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
