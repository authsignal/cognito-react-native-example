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
  }).then(handleResponse);

  return response.authsignalToken;
}

function handleResponse(response: any) {
  if (response.status !== 200) {
    console.log('Error: ', response);
  }

  return response.json();
}
