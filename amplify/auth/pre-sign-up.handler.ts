import type { PreSignUpTriggerHandler } from 'aws-lambda';

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email;

  const whitelist = [
    '[REDACTED_EMAIL]',
    'dev1@sharklasers.com'
  ];

  if (whitelist.includes(email)) {
    return event;
  }

  throw new Error(`Access denied: ${email} is not on the whitelist.`);
};
