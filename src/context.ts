import React, {useContext} from 'react';

export type AppContextType = {
  authenticated: boolean;
  email?: string;
  setEmail: (value: string) => any;
  setAuthenticated: (value: boolean) => any;
};

export const AppContext = React.createContext<AppContextType>({
  authenticated: false,
  email: undefined,
  setEmail: () => {},
  setAuthenticated: () => {},
});

export const useAppContext = () => useContext(AppContext);
