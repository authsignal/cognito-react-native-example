import {API_GATEWAY_ID, AWS_REGION} from '@env';
import {getAccessToken} from './cognito';
import {authsignal} from './authsignal';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

interface InitSmsChallengeInput {
  phoneNumber: string;
}

interface InitSmsChallengeResponse {
  challengeId: string;
}

export async function initSmsChallenge(input: InitSmsChallengeInput): Promise<InitSmsChallengeResponse> {
  return await fetch(`${url}/challenge/sms`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());
}

interface VerifySmsChallengeInput {
  challengeId: string;
  verificationCode: string;
  phoneNumber: string;
}

interface VerifySmsChallengeResponse {
  isVerified: boolean;
  userId?: string;
  token?: string;
}

export async function verifySmsChallenge(input: VerifySmsChallengeInput): Promise<VerifySmsChallengeResponse> {
  return await fetch(`${url}/verify/sms`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());
}

interface AddAuthenticatorInput {
  phoneNumber?: string;
  email?: string;
}

interface SocialAuthInput {
  idToken?: string | null;
}

interface SocialAuthResponse {
  username: string;
}

export async function initSocialAuth(input: SocialAuthInput): Promise<SocialAuthResponse> {
  return await fetch(`${url}/init-social-auth`, {
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
