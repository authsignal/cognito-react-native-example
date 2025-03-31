import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
  GetUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Cognito region and user pool client ID
const region = 'us-west-2';
const cognitoUserPoolClientId = '';

export const cognito = new CognitoIdentityProviderClient({region});

interface SignUpInput {
  username: string;
  phoneNumber: string;
}

export async function signUp({username, phoneNumber}: SignUpInput): Promise<void> {
  const signUpCommand = new SignUpCommand({
    ClientId: cognitoUserPoolClientId,
    Username: username,
    Password: Math.random().toString(36).slice(-16) + 'X', // Dummy value - never used
    UserAttributes: [
      {
        Name: 'phone_number',
        Value: phoneNumber,
      },
    ],
  });

  await cognito.send(signUpCommand);
}

interface InitiateAuthResponse {
  session: any;
  token?: string;
  isEnrolled: boolean;
}

export async function initiateAuth(username: string): Promise<InitiateAuthResponse> {
  const initiateAuthCommand = new InitiateAuthCommand({
    ClientId: cognitoUserPoolClientId,
    AuthFlow: AuthFlowType.CUSTOM_AUTH,
    AuthParameters: {
      USERNAME: username,
    },
  });

  const initiateAuthOutput = await cognito.send(initiateAuthCommand);

  if (!initiateAuthOutput.Session) {
    throw new Error('Cognito could not start custom auth flow');
  }

  return {
    session: initiateAuthOutput.Session,
    token: initiateAuthOutput.ChallengeParameters?.token,
    isEnrolled: initiateAuthOutput.ChallengeParameters?.isEnrolled === 'true',
  };
}

interface CompleteSignInInput {
  session: any;
  username: string;
  answer: string;
}

export async function respondToAuthChallenge({session, username, answer}: CompleteSignInInput): Promise<void> {
  const respondToAuthChallengeCommand = new RespondToAuthChallengeCommand({
    ClientId: cognitoUserPoolClientId,
    ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      ANSWER: answer,
    },
  });

  const respondToAuthChallengeOutput = await cognito.send(respondToAuthChallengeCommand);

  const accessToken = respondToAuthChallengeOutput.AuthenticationResult?.AccessToken;

  if (!accessToken) {
    throw new Error('Cognito did not return an access token');
  }

  await AsyncStorage.setItem('@access_token', accessToken);
}

export async function getAccessToken(): Promise<string> {
  const accessToken = await AsyncStorage.getItem('@access_token');

  if (!accessToken) {
    throw new Error('Access token not found');
  }

  return accessToken;
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem('@access_token');
}

export async function updateEmail(email: string) {
  const accessToken = await getAccessToken();

  const updateUserAttributesCommand = new UpdateUserAttributesCommand({
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
    ],
    AccessToken: accessToken,
  });

  await cognito.send(updateUserAttributesCommand);
}

interface CompleteRegistrationInput {
  givenName: string;
  familyName: string;
  birthdate?: string;
}

export async function completeRegistration({
  givenName,
  familyName,
  birthdate,
}: CompleteRegistrationInput): Promise<void> {
  const accessToken = await getAccessToken();

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
      {
        Name: 'birthdate',
        Value: birthdate,
      },
      {
        Name: 'custom:has_registered',
        Value: 'true',
      },
    ],
    AccessToken: accessToken,
  });

  await cognito.send(updateUserAttributesCommand);
}

interface UserAttributes {
  username?: string;
  phoneNumber?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  birthdate?: string;
  hasCompletedRegistration: boolean;
}

export async function getUserAttributes(): Promise<UserAttributes> {
  const accessToken = await getAccessToken();

  const getUserCommand = new GetUserCommand({
    AccessToken: accessToken,
  });

  const getUserOutput = await cognito.send(getUserCommand);

  const username = getUserOutput.Username;

  const phoneNumber = getUserOutput.UserAttributes?.find(attr => attr.Name === 'phone_number')?.Value;
  const email = getUserOutput.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
  const givenName = getUserOutput.UserAttributes?.find(attr => attr.Name === 'given_name')?.Value;
  const familyName = getUserOutput.UserAttributes?.find(attr => attr.Name === 'family_name')?.Value;
  const birthdate = getUserOutput.UserAttributes?.find(attr => attr.Name === 'birthdate')?.Value;

  const hasCompletedRegistration =
    getUserOutput.UserAttributes?.find(attr => attr.Name === 'custom:has_registered')?.Value === 'true';

  return {
    username,
    phoneNumber,
    email,
    givenName,
    familyName,
    birthdate,
    hasCompletedRegistration,
  };
}
