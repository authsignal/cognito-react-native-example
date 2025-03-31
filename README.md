# Getting Started

1. Enter your Authsignal tenant ID and region URL in `src/authsignal.ts`

```
// TODO: Replace with your Authsignal tenant ID and the base URL for your region
const authsignalArgs = {
  tenantID: '',
  baseURL: 'https://au.api.authsignal.com/v1',
};
```

2. Enter your Cognito region and user pool client ID in `src/cognito.ts`

```
// TODO: Replace with your Cognito region and user pool client ID
const region = 'us-west-2';
const cognitoUserPoolClientId = '';
```
