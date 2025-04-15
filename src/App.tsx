import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {CreatePasskeyScreen} from './CreatePasskeyScreen';
import {EmailScreen} from './EmailScreen';
import {HomeScreen} from './HomeScreen';
import {NameScreen} from './NameScreen';
import {SignInScreen} from './SignInScreen';
import {VerifyEmailScreen} from './VerifyEmailScreen';
import {VerifySmsScreen} from './VerifySmsScreen';
import {AppContext, useAppContext} from './context';
import {clearAccessToken, getAccessToken, getUserAttributes} from './cognito';

const Stack = createStackNavigator();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [givenName, setGivenName] = useState<string | undefined>();
  const [familyName, setFamilyName] = useState<string | undefined>();

  useEffect(() => {
    const initUser = async () => {
      const accessToken = await getAccessToken();

      if (accessToken) {
        const attr = await getUserAttributes();

        if (attr.email) {
          setEmail(attr.email);
        }

        if (attr.givenName && attr.familyName) {
          setGivenName(attr.givenName);
          setFamilyName(attr.familyName);
        }

        setUsername(attr.username);
      }

      setInitialized(true);
    };

    initUser();
  }, []);

  function setVerifiedEmail(value?: string) {
    setEmail(value);
  }

  function setNames(gn?: string, fn?: string) {
    setGivenName(gn);
    setFamilyName(fn);
  }

  const appContext = useMemo(
    () => ({
      username,
      email,
      givenName,
      familyName,
      setUsername,
      setVerifiedEmail,
      setNames,
    }),
    [username, email, givenName, familyName],
  );

  if (!initialized) {
    return null;
  }

  return (
    <AppContext.Provider value={appContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {username ? (
            <Stack.Screen name="SignedInStack" component={SignedInStack} />
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Group
                screenOptions={{
                  headerShown: true,
                  presentation: 'modal',
                }}>
                <Stack.Screen
                  name="VerifySms"
                  component={VerifySmsScreen}
                  options={{
                    title: '',
                    headerBackTitle: 'Back',
                  }}
                />
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
  const {email, givenName, familyName, setUsername, setVerifiedEmail, setNames} = useAppContext();

  const onSignOutPressed = async () => {
    await clearAccessToken();

    setUsername(undefined);
    setVerifiedEmail(undefined);
    setNames(undefined, undefined);
  };

  if (!email) {
    return (
      <Stack.Navigator screenOptions={{headerTitle: ''}}>
        <Stack.Screen name="Email" component={EmailScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      </Stack.Navigator>
    );
  }

  if (!givenName || !familyName) {
    return (
      <Stack.Navigator screenOptions={{headerTitle: ''}}>
        <Stack.Screen name="Name" component={NameScreen} />
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
                Alert.alert('Do you want to sign out?', '', [
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
          presentation: 'modal',
          headerShown: false,
        }}>
        <Stack.Screen name="CreatePasskey" component={CreatePasskeyScreen} />
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
