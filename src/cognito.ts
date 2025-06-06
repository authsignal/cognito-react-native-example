import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
  GetUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {AWS_REGION, USER_POOL_CLIENT_ID} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cognito = new CognitoIdentityProviderClient({region: AWS_REGION});

async function initiateAuth(username: string) {
  const command = new InitiateAuthCommand({
    ClientId: USER_POOL_CLIENT_ID,
    AuthFlow: AuthFlowType.CUSTOM_AUTH,
    AuthParameters: {
      USERNAME: username,
    },
  });

  return await cognito.send(command);
}

interface RespondToAuthChallengeInput {
  session: any;
  username: string;
  answer: string;
  clientMetadata?: Record<string, string>;
}

async function respondToAuthChallenge(input: RespondToAuthChallengeInput) {
  const {session, username, answer, clientMetadata} = input;

  const command = new RespondToAuthChallengeCommand({
    ClientId: USER_POOL_CLIENT_ID,
    ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      ANSWER: answer,
    },
    ClientMetadata: clientMetadata,
  });

  const output = await cognito.send(command);

  const accessToken = output.AuthenticationResult?.AccessToken;

  if (accessToken) {
    await setAccessToken(accessToken);
  }

  return output;
}

interface CognitoAuthInput {
  username?: string;
  token?: string | null;
}

export async function handleCognitoAuth({username, token}: CognitoAuthInput): Promise<void> {
  if (!username || !token) {
    throw new Error('Username and token are required for Cognito auth');
  }

  const provideAuthParamsOutput = await initiateAuth(username);

  const challengeOutput = await respondToAuthChallenge({
    session: provideAuthParamsOutput.Session,
    username,
    answer: token,
  });

  const accessToken = challengeOutput.AuthenticationResult?.AccessToken;

  if (!accessToken) {
    throw new Error('Cognito did not return an access token');
  }

  await setAccessToken(accessToken);
}

export async function setAccessToken(accessToken: string): Promise<void> {
  await AsyncStorage.setItem('@access_token', accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  const accessToken = await AsyncStorage.getItem('@access_token');

  return accessToken;
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem('@access_token');
}

export interface CognitoUserAttributes {
  username?: string;
  phoneNumber?: string;
  phoneNumberVerified: boolean;
  email?: string;
  emailVerified: boolean;
}

export async function getUserAttributes(): Promise<CognitoUserAttributes> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const getUserCommand = new GetUserCommand({AccessToken: accessToken});

  const getUserOutput = await cognito.send(getUserCommand);

  const username = getUserOutput.Username;
  const phoneNumber = getUserOutput.UserAttributes?.find(attr => attr.Name === 'phone_number')?.Value;
  const phoneNumberVerified =
    getUserOutput.UserAttributes?.find(attr => attr.Name === 'phone_number_verified')?.Value === 'true';
  const email = getUserOutput.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
  const emailVerified = getUserOutput.UserAttributes?.find(attr => attr.Name === 'email_verified')?.Value === 'true';

  return {
    username,
    phoneNumber,
    phoneNumberVerified,
    email,
    emailVerified,
  };
}
