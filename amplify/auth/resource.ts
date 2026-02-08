import { defineAuth, defineFunction, secret } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  triggers: {
    preSignUp: defineFunction({
      name: 'preSignUp',
      entry: './pre-sign-up.handler.ts',
      environment: {
        ADMIN_WHITELIST: secret('ADMIN_WHITELIST')
      }
    })
  }
});

