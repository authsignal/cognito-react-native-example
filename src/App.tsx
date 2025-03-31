import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {AccountDetailsScreen} from './AccountDetailsScreen';
import {CreatePasskeyScreen} from './CreatePasskeyScreen';
import {EmailScreen} from './EmailScreen';
import {HomeScreen} from './HomeScreen';
import {SignInScreen} from './SignInScreen';
import {SignInSmsScreen} from './SignInSmsScreen';
import {VerifySmsScreen} from './VerifySmsScreen';
import {AppContext, useAppContext} from './context';
import {clearAccessToken, getAccessToken, getUserAttributes} from './cognito';

const Stack = createStackNavigator();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hasCompletedRegistration, setHasCompletedRegistration] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const accessToken = await getAccessToken();

      setIsSignedIn(!!accessToken);

      if (accessToken) {
        const userAttributes = await getUserAttributes();

        setHasCompletedRegistration(userAttributes.hasCompletedRegistration);
      }

      setInitialized(true);
    };

    initUser();
  }, []);

  const appContext = useMemo(
    () => ({
      isSignedIn,
      hasCompletedRegistration,
      setIsSignedIn,
      setHasCompletedRegistration,
    }),
    [isSignedIn, hasCompletedRegistration],
  );

  if (!initialized) {
    return null;
  }

  return (
    <AppContext.Provider value={appContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{animationEnabled: false, headerShown: false}}>
          {isSignedIn ? (
            <Stack.Screen name="SignedInStack" component={SignedInStack} />
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
    </AppContext.Provider>
  );
}

export default App;

function SignedInStack() {
  const {hasCompletedRegistration, setIsSignedIn} = useAppContext();

  const onSignOutPressed = async () => {
    await clearAccessToken();

    setIsSignedIn(false);
  };

  if (!hasCompletedRegistration) {
    return (
      <Stack.Navigator screenOptions={{headerTitle: ''}}>
        <Stack.Screen name="Email" component={EmailScreen} />
        <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      </Stack.Navigator>
    );
  }

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
                const accessToken = await getAccessToken();

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
      <Stack.Group
        screenOptions={{
          animationEnabled: true,
          headerShown: true,
          presentation: 'modal',
          headerTitle: '',
          headerBackTitle: 'Back',
        }}>
        <Stack.Screen name="CreatePasskey" component={CreatePasskeyScreen} />
      </Stack.Group>
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
          title: '',
        }}
      />
      <Stack.Screen
        name="VerifySms"
        component={VerifySmsScreen}
        options={{
          title: '',
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
