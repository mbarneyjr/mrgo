export async function getUserToken(userPoolId: string, appClientId: string, username: string, password: string): Promise<string>

export async function deleteUser(userPoolId: string, username: string): Promise<void>
