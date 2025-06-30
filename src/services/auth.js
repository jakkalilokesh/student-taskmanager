import { Auth } from 'aws-amplify';

export const getCurrentUser = async () => {
  try {
    return await Auth.currentAuthenticatedUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateUserAttributes = async (user, attributes) => {
  try {
    await Auth.updateUserAttributes(user, attributes);
    return true;
  } catch (error) {
    console.error('Error updating user attributes:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};