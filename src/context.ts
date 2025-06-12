import React, {useContext} from 'react';
import {CognitoUserAttributes} from './cognito';
import {PushCredential} from 'react-native-authsignal';

export type AppContextType = {
  username?: string;
  email?: string;
  phoneNumber?: string;
  givenName?: string;
  familyName?: string;
  deviceCredential?: PushCredential;
  setUserAttributes: () => Promise<CognitoUserAttributes>;
  clearUserAttributes: () => void;
  setDeviceCredential: (credential: PushCredential | undefined) => void;
};

export const AppContext = React.createContext<AppContextType>({
  setUserAttributes: async () => ({phoneNumberVerified: false, emailVerified: false}),
  clearUserAttributes: () => {},
  setDeviceCredential: () => {},
});

export const useAppContext = () => useContext(AppContext);
