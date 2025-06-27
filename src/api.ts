import {API_GATEWAY_ID, AWS_REGION, AUTHSIGNAL_CLIENT} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authsignal} from './authsignal';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

const clientId = AUTHSIGNAL_CLIENT;

export async function initEmailSignIn(email: string) {
  const response = await fetch(`${url}/sign-in/email`, {
    method: 'POST',
    body: JSON.stringify({email}),
  }).then(res => res.json());

  await authsignal.setToken(response.token);
}

interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

export async function signIn(token: string): Promise<SignInResponse> {
  return await fetch(`${url}/sign-in`, {
    method: 'POST',
    body: JSON.stringify({token, clientId}),
  }).then(res => res.json());
}

export async function signOut(accessToken: string): Promise<void> {
  await fetch(`${url}/sign-out`, {
    method: 'POST',
    body: JSON.stringify({accessToken}),
  });
}

export async function getUserProfile() {
  const accessToken = await AsyncStorage.getItem('@access_token');

  return await fetch(`${url}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());
}

export async function initPasskeyRegistration() {
  const accessToken = await AsyncStorage.getItem('@access_token');

  const response = await fetch(`${url}/authenticators`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());

  await authsignal.setToken(response.token);
}
