import {Authsignal} from 'react-native-authsignal';

// TODO: Replace with your Authsignal tenant ID and region URL
const authsignalArgs = {
  tenantID: '',
  baseURL: 'https://api.authsignal.com/v1', // Change for your region if required
};

export const authsignal = new Authsignal(authsignalArgs);
