import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminDisableUserCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

/** @type {import('./auth').getUserToken} */
export async function getUserToken(userPoolId, appClientId, username, password) {
  const client = new CognitoIdentityProviderClient({});
  await client.send(new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: username,
    DesiredDeliveryMediums: [],
    MessageAction: 'SUPPRESS',
  }));
  await client.send(new AdminSetUserPasswordCommand({
    Username: username,
    Password: password,
    UserPoolId: userPoolId,
    Permanent: true,
  }));
  const initiateAuthResponse = await client.send(new AdminInitiateAuthCommand({
    UserPoolId: userPoolId,
    ClientId: appClientId,
    AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  }));
  if (!initiateAuthResponse.AuthenticationResult.IdToken) throw new Error('IdToken not returned from AdminInitiateAuth call');
  return initiateAuthResponse.AuthenticationResult.IdToken;
}

/** @type {import('./auth').deleteUser} */
export async function deleteUser(userPoolId, username) {
  const client = new CognitoIdentityProviderClient({});
  await client.send(new AdminDisableUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  }));
  await client.send(new AdminDeleteUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  }));
}
