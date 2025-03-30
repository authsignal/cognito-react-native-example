import React, {useContext} from 'react';

type AuthContextType = {
  isSignedIn: boolean;
  setIsSignedIn: (value: boolean) => void;
};

export const AuthContext = React.createContext<AuthContextType>({
  isSignedIn: false,
  setIsSignedIn: (_value: boolean) => {},
});

export const useAuthContext = () => useContext(AuthContext);
