import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {CreatePasskeyScreen} from './CreatePasskeyScreen';
import {PushChallengeScreen} from './PushChallengeScreen';
import {EnrollEmailScreen} from './EnrollEmailScreen';
import {HomeScreen} from './HomeScreen';
import {NameScreen} from './NameScreen';
import {SignInScreen} from './SignInScreen';
import {VerifyEmailScreen} from './VerifyEmailScreen';
import {VerifySmsScreen} from './VerifySmsScreen';
import {EnrollSmsScreen} from './EnrollSmsScreen';
import {AppContext} from './context';
import {clearAccessToken, getAccessToken, getUserAttributes} from './cognito';
import {authsignal} from './authsignal';

const Stack = createStackNavigator();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [givenName, setGivenName] = useState<string | undefined>();
  const [familyName, setFamilyName] = useState<string | undefined>();

  const setUserAttributes = useCallback(async () => {
    const attrs = await getUserAttributes();

    if (attrs.email && attrs.emailVerified) {
      setEmail(attrs.email);
    }

    if (attrs.phoneNumber && attrs.phoneNumberVerified) {
      setPhoneNumber(attrs.phoneNumber);
    }

    if (attrs.givenName && attrs.familyName) {
      setGivenName(attrs.givenName);
      setFamilyName(attrs.familyName);
    }

    setUsername(attrs.username);

    return attrs;
  }, []);

  const clearUserAttributes = useCallback(() => {
    setEmail(undefined);
    setGivenName(undefined);
    setFamilyName(undefined);
    setUsername(undefined);
  }, []);

  useEffect(() => {
    const initUser = async () => {
      const accessToken = await getAccessToken();

      if (accessToken) {
        await setUserAttributes();
      }

      setInitialized(true);
    };

    initUser();
  }, [setUserAttributes]);

  const appContext = useMemo(
    () => ({
      username,
      email,
      phoneNumber,
      givenName,
      familyName,
      setUserAttributes,
      clearUserAttributes,
    }),
    [username, email, phoneNumber, givenName, familyName, setUserAttributes, clearUserAttributes],
  );

  const onSignOutPressed = async () => {
    await authsignal.push.removeCredential();

    await clearAccessToken();

    clearUserAttributes();
  };

  if (!initialized) {
    return null;
  }

  const hasAllUserAttributes = !!email && !!phoneNumber && !!givenName && !!familyName;

  return (
    <AppContext.Provider value={appContext}>
      <NavigationContainer>
        {hasAllUserAttributes ? (
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
              <Stack.Screen name="PushChallenge" component={PushChallengeScreen} />
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
  const {phoneNumber, phoneNumberVerified, givenName, familyName} = route.params;

  const getInitialRouteName = () => {
    if (phoneNumber) {
      return 'VerifySms';
    }

    if (!phoneNumberVerified) {
      return 'EnrollSms';
    }

    if (!givenName || !familyName) {
      return 'Name';
    }
  };

  const initialRouteName = getInitialRouteName();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: '',
        headerBackTitle: 'Back',
      }}
      initialRouteName={initialRouteName}>
      <Stack.Group>
        <Stack.Screen name="EnrollSms" component={EnrollSmsScreen} initialParams={route.params} />
        <Stack.Screen name="VerifySms" component={VerifySmsScreen} initialParams={route.params} />
        <Stack.Screen name="EnrollEmail" component={EnrollEmailScreen} initialParams={route.params} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} initialParams={route.params} />
        <Stack.Screen name="Name" component={NameScreen} initialParams={route.params} />
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
