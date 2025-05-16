import {appleAuth} from '@invertase/react-native-apple-authentication';

export async function signInWithApple() {
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  return appleAuthRequestResponse;
}
