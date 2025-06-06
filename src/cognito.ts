import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
  GetUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {AWS_REGION, USER_POOL_CLIENT_ID} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cognito = new CognitoIdentityProviderClient({region: AWS_REGION});

async function initiateAuth(username: string) {
  const initiateAuthCommand = new InitiateAuthCommand({
    ClientId: USER_POOL_CLIENT_ID,
    AuthFlow: AuthFlowType.CUSTOM_AUTH,
    AuthParameters: {
      USERNAME: username,
    },
  });

  return await cognito.send(initiateAuthCommand);
}

interface RespondToAuthChallengeInput {
  session: any;
  username: string;
  answer: string;
  clientMetadata?: Record<string, string>;
}

export async function respondToAuthChallenge(input: RespondToAuthChallengeInput) {
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
    await AsyncStorage.setItem('@access_token', accessToken);
  }

  return output;
}

export async function initiateSmsAuth(username: string) {
  const provideAuthParamsOutput = await initiateAuth(username);

  const challengeResponse = await respondToAuthChallenge({
    session: provideAuthParamsOutput.Session,
    username,
    answer: '__dummy__',
    clientMetadata: {signInMethod: 'SMS'},
  });

  const token = challengeResponse.ChallengeParameters!.token;
  const session = challengeResponse.Session;

  return {
    session,
    token,
  };
}

export async function initiateEmailAuth(username: string) {
  const provideAuthParamsOutput = await initiateAuth(username);

  const challengeResponse = await respondToAuthChallenge({
    session: provideAuthParamsOutput.Session,
    username,
    answer: '__dummy__',
    clientMetadata: {signInMethod: 'EMAIL'},
  });

  const token = challengeResponse.ChallengeParameters!.token;
  const session = challengeResponse.Session;

  return {
    session,
    token,
  };
}

interface TokenAuthInput {
  username?: string;
  token?: string | null;
  signInMethod: 'PASSKEY' | 'APPLE' | 'GOOGLE';
}

export async function handleTokenAuth({username, token, signInMethod}: TokenAuthInput): Promise<void> {
  if (!username || !token) {
    throw new Error('Username and token are required for token auth');
  }

  const provideAuthParamsOutput = await initiateAuth(username);

  // Provide auth params
  const authParamsOutput = await respondToAuthChallenge({
    session: provideAuthParamsOutput.Session,
    username,
    clientMetadata: {signInMethod},
    answer: '__dummy__',
  });

  // Verify challenge with token
  const challengeOutput = await respondToAuthChallenge({
    session: authParamsOutput.Session,
    username,
    answer: token,
  });

  const accessToken = challengeOutput.AuthenticationResult?.AccessToken;

  if (!accessToken) {
    throw new Error('Cognito did not return an access token');
  }

  await AsyncStorage.setItem('@access_token', accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  const accessToken = await AsyncStorage.getItem('@access_token');

  return accessToken;
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem('@access_token');
}

export async function updateNameAttributes(givenName: string, familyName: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const updateUserAttributesCommand = new UpdateUserAttributesCommand({
    UserAttributes: [
      {
        Name: 'given_name',
        Value: givenName,
      },
      {
        Name: 'family_name',
        Value: familyName,
      },
    ],
    AccessToken: accessToken,
  });

  await cognito.send(updateUserAttributesCommand);
}

export interface CognitoUserAttributes {
  username?: string;
  phoneNumber?: string;
  phoneNumberVerified: boolean;
  email?: string;
  emailVerified: boolean;
  givenName?: string;
  familyName?: string;
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
  const givenName = getUserOutput.UserAttributes?.find(attr => attr.Name === 'given_name')?.Value;
  const familyName = getUserOutput.UserAttributes?.find(attr => attr.Name === 'family_name')?.Value;

  return {
    username,
    phoneNumber,
    phoneNumberVerified,
    email,
    emailVerified,
    givenName,
    familyName,
  };
}
