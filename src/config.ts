import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import {CognitoIdentityProviderClient} from '@aws-sdk/client-cognito-identity-provider';
import {Authsignal} from 'react-native-authsignal';

const authsignalArgs = {
  tenantID: '',
  baseURL: 'https://api.authsignal.com/v1', // Change for your region if required
};

export const authsignal = new Authsignal(authsignalArgs);

const region = 'us-west-2'; // Change to your AWS region

export const cognito = new CognitoIdentityProviderClient({region});

export const cognitoUserPoolClientId = '';
