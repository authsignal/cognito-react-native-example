import React, {useContext} from 'react';

type AppContextType = {
  isSignedIn: boolean;
  hasCompletedRegistration: boolean;
  setIsSignedIn: (value: boolean) => void;
  setHasCompletedRegistration: (value: boolean) => void;
};

export const AppContext = React.createContext<AppContextType>({
  isSignedIn: false,
  hasCompletedRegistration: false,
  setIsSignedIn: (_value: boolean) => {},
  setHasCompletedRegistration: (_value: boolean) => {},
});

export const useAppContext = () => useContext(AppContext);
