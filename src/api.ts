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
}

interface VerifySmsChallengeResponse {
  isVerified: boolean;
  accessToken?: string;
}

export async function verifySmsChallenge(input: VerifySmsChallengeInput): Promise<VerifySmsChallengeResponse> {
  return await fetch(`${url}/verify/sms`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());
}

interface InitEmailChallengeInput {
  email: string;
}

interface InitEmailChallengeResponse {
  challengeId: string;
}

export async function initEmailChallenge(input: InitEmailChallengeInput): Promise<InitEmailChallengeResponse> {
  return await fetch(`${url}/challenge/email`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());
}

interface VerifyEmailChallengeInput {
  smsChallengeId: string;
  emailChallengeId: string;
  emailVerificationCode: string;
}

interface VerifyEmailChallengeResponse {
  isVerified: boolean;
  accessToken?: string;
}

export async function verifyEmailChallenge(input: VerifyEmailChallengeInput): Promise<VerifyEmailChallengeResponse> {
  return await fetch(`${url}/verify/email`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());
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

export async function authorizePasskeyCreation() {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/authenticators/passkey`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());

  await authsignal.setToken(response.authsignalToken);
}
