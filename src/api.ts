import {API_GATEWAY_ID, AWS_REGION} from '@env';
import * as Keychain from 'react-native-keychain';

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

  await setAccessToken(response.accessToken);
  await setRefreshToken(response.refreshToken);
}

export async function signOut(): Promise<void> {
  const accessToken = await getAccessToken();

  await fetch(`${url}/sign-out`, {
    method: 'POST',
    body: JSON.stringify({accessToken}),
  });

  await clearAccessToken();
  await clearRefreshToken();
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
  const accessToken = await getAccessToken();

  init.headers = {
    ...init.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(path, init);

  if (response.status === 401 || response.status === 403) {
    const refreshResponse = await refreshSession();

    await setAccessToken(refreshResponse.accessToken);
    await setRefreshToken(refreshResponse.refreshToken);

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
  const refreshToken = await getRefreshToken();

  const response = await fetch(`${url}/sign-in/refresh`, {
    method: 'POST',
    body: JSON.stringify({refreshToken}),
  }).then(res => res.json());

  if (!response.accessToken || !response.refreshToken) {
    throw new Error('Refresh session failed.');
  }

  return response;
}

const ACCESS_TOKEN_KEY = '@access_token';
const ACCESS_TOKEN_OPTS = {service: ACCESS_TOKEN_KEY};
const REFRESH_TOKEN_KEY = '@refresh_token';
const REFRESH_TOKEN_OPTS = {service: REFRESH_TOKEN_KEY};

export async function setAccessToken(token: string) {
  await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, token, ACCESS_TOKEN_OPTS);
}

async function setRefreshToken(token: string) {
  await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, token, REFRESH_TOKEN_OPTS);
}

export async function getAccessToken() {
  const credentials = await Keychain.getGenericPassword(ACCESS_TOKEN_OPTS);

  return credentials ? credentials.password : undefined;
}

export async function getRefreshToken() {
  const credentials = await Keychain.getGenericPassword(REFRESH_TOKEN_OPTS);

  return credentials ? credentials.password : undefined;
}

export async function clearAccessToken() {
  await Keychain.resetGenericPassword(ACCESS_TOKEN_OPTS);
}

export async function clearRefreshToken() {
  await Keychain.resetGenericPassword(REFRESH_TOKEN_OPTS);
}
