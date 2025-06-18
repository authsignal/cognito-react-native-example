import {API_GATEWAY_ID, AWS_REGION} from '@env';
import {getAccessToken} from './cognito';
import {authsignal} from './authsignal';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

interface StartSignInInput {
  phoneNumber?: string;
  email?: string;
  idToken?: string | null;
}

interface StartSignInResponse {
  username?: string;
}

export async function startSignIn(input: StartSignInInput): Promise<StartSignInResponse> {
  return await fetch(`${url}/start-sign-in`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());
}

interface AddAuthenticatorInput {
  phoneNumber?: string;
  email?: string;
}

export async function addAuthenticator(input: AddAuthenticatorInput = {}) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/authenticators`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());

  await authsignal.setToken(response.authsignalToken);
}

export async function verifyAuthenticator(token: string) {
  const accessToken = await getAccessToken();

  await fetch(`${url}/authenticators/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({token}),
  });
}

interface TransferFundsInput {
  amount?: string;
  token?: string;
}

interface TransferFundsResponse {
  transferCompleted: boolean;
  token?: string;
}

export async function transferFunds(input: TransferFundsInput): Promise<TransferFundsResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/transfer-funds`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());

  return {
    transferCompleted: response.transferCompleted,
  };
}
