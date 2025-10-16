import { handleGoogleCallback } from '../../../controllers/googleOAuthController';

export default async function handler(req, res) {
  return handleGoogleCallback(req, res);
}
