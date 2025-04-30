import {API_GATEWAY_ID, AWS_REGION} from '@env';
import {getAccessToken} from './cognito';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com/authenticators`;

export async function addAuthenticator(): Promise<string> {
  const accessToken = await getAccessToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());

  return response.authsignalToken;
}

interface VerifyEmailInput {
  email: string;
  token: string;
}

export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/email/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  }).then(res => res.json());

  if (response?.error) {
    throw new Error(`Error verifying email: ${response.error}`);
  }
}
