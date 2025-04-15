import {AUTHSIGNAL_TENANT, AUTHSIGNAL_URL} from '@env';
import {Authsignal} from 'react-native-authsignal';

const authsignalArgs = {
  tenantID: AUTHSIGNAL_TENANT,
  baseURL: AUTHSIGNAL_URL,
};

export const authsignal = new Authsignal(authsignalArgs);
