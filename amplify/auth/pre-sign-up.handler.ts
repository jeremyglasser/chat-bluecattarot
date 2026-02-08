import type { PreSignUpTriggerHandler } from 'aws-lambda';

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email;
  const adminWhitelist = process.env.ADMIN_WHITELIST || '';
  const whitelist = adminWhitelist.split(',').map(e => e.trim()).filter(e => e.length > 0);

  if (whitelist.includes(email)) {
    return event;
  }

  throw new Error(`Access denied: ${email} is not on the whitelist.`);

};
