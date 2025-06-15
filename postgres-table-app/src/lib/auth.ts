"use client";

import { Amplify, Auth } from 'aws-amplify';

// Get Cognito configuration from environment variables
const REGION = process.env.NEXT_PUBLIC_COGNITO_REGION;
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const APP_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;
const IDENTITY_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID;

// Log configuration for debugging
console.log('Cognito Config:', { 
  region: REGION,
  userPoolId: USER_POOL_ID ? USER_POOL_ID.substring(0, 5) + '...' : undefined,
  clientId: APP_CLIENT_ID ? APP_CLIENT_ID.substring(0, 5) + '...' : undefined,
  identityPoolId: IDENTITY_POOL_ID ? IDENTITY_POOL_ID.substring(0, 5) + '...' : undefined
});

// Configure Amplify
if (typeof window !== 'undefined') {
  Amplify.configure({
    Auth: {
      region: REGION,
      userPoolId: USER_POOL_ID,
      userPoolWebClientId: APP_CLIENT_ID,
      identityPoolId: IDENTITY_POOL_ID,
    },
    ssr: true
  });
}

export async function signIn(username: string, password: string) {
  try {
    const user = await Auth.signIn(username, password);
    
    // Store the ID token in a cookie for middleware access
    if (user && user.signInUserSession) {
      const idToken = user.signInUserSession.idToken.jwtToken;
      document.cookie = `idToken=${idToken}; path=/; max-age=3600; SameSite=Strict`;
    }
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Failed to sign in' };
  }
}

export async function signOut() {
  try {
    await Auth.signOut();
    
    // Clear the auth cookie
    document.cookie = 'idToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Failed to sign out' };
  }
}

export async function getCurrentUser() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return { user, error: null };
  } catch (error) {
    return { user: null, error: null }; // Not signed in
  }
}

export async function isAuthenticated() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return !!user;
  } catch {
    return false;
  }
}