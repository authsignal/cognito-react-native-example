import {API_GATEWAY_ID, AWS_REGION} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {authsignal} from './authsignal';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

export async function initEmailSignIn(email: string) {
  const response = await fetch(`${url}/sign-in/email`, {
    method: 'POST',
    body: JSON.stringify({email}),
  }).then(res => res.json());

  await authsignal.setToken(response.token);
}

export async function signIn(token: string): Promise<void> {
  const response = await fetch(`${url}/sign-in`, {
    method: 'POST',
    body: JSON.stringify({token}),
  }).then(res => res.json());

  if (!response.accessToken || !response.refreshToken) {
    throw new Error('Sign-in failed.');
  }

  await AsyncStorage.setItem('@access_token', response.accessToken);
  await AsyncStorage.setItem('@refresh_token', response.refreshToken);
}

export async function signOut(): Promise<void> {
  const accessToken = await AsyncStorage.getItem('@access_token');

  await fetch(`${url}/sign-out`, {
    method: 'POST',
    body: JSON.stringify({accessToken}),
  });

  await AsyncStorage.removeItem('@access_token');
  await AsyncStorage.removeItem('@refresh_token');
}

export async function getUserAuthenticators() {
  return await fetchWithAuth(`${url}/authenticators`, {method: 'GET'});
}

export async function initPasskeyRegistration() {
  const response = await fetchWithAuth(`${url}/register/passkey`, {method: 'POST'});

  await authsignal.setToken(response.token);
}

export async function getUserProfile() {
  return await fetchWithAuth(`${url}/profile`, {method: 'GET'});
}

async function fetchWithAuth(path: string, init: RequestInit): Promise<any> {
  const accessToken = await AsyncStorage.getItem('@access_token');

  init.headers = {
    ...init.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(path, init);

  if (response.status === 401 || response.status === 403) {
    const refreshResponse = await refreshSession();

    await AsyncStorage.setItem('@access_token', refreshResponse.accessToken);
    await AsyncStorage.setItem('@refresh_token', refreshResponse.refreshToken);

    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${refreshResponse.accessToken}`,
    };

    console.log('Session refreshed successfully. Retrying request...');

    const responseAfterRefresh = await fetch(path, init);

    if (!responseAfterRefresh.ok) {
      handleError(responseAfterRefresh);
    }

    console.log('Request succeeded with fresh access token.');

    return responseAfterRefresh.json();
  } else if (!response.ok) {
    await handleError(response);
  }

  return response.json();
}

async function handleError(response: Response) {
  const json = await response.json();

  throw new Error(json.message ?? 'An error occurred');
}

async function refreshSession() {
  const refreshToken = await AsyncStorage.getItem('@refresh_token');

  const response = await fetch(`${url}/sign-in/refresh`, {
    method: 'POST',
    body: JSON.stringify({refreshToken}),
  }).then(res => res.json());

  if (!response.accessToken || !response.refreshToken) {
    throw new Error('Refresh session failed.');
  }

  return response;
}
