import React, {useContext} from 'react';
import {CognitoUserAttributes} from './cognito';

export type AppContextType = {
  username?: string;
  email?: string;
  phoneNumber?: string;
  setUserAttributes: () => Promise<CognitoUserAttributes>;
  clearUserAttributes: () => void;
};

export const AppContext = React.createContext<AppContextType>({
  setUserAttributes: async () => ({phoneNumberVerified: false, emailVerified: false}),
  clearUserAttributes: () => {},
});

export const useAppContext = () => useContext(AppContext);
