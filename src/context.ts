import React, {useContext} from 'react';

export type AppContextType = {
  username?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  setUsername: (username?: string) => void;
  setVerifiedEmail: (email?: string) => void;
  setNames: (givenName?: string, familyName?: string) => void;
};

export const AppContext = React.createContext<AppContextType>({
  setUsername: (_username?: string) => {},
  setVerifiedEmail: (_email?: string) => {},
  setNames: (_givenName?: string, _familyName?: string) => {},
});

export const useAppContext = () => useContext(AppContext);
