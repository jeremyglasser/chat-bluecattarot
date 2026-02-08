import { defineAuth, defineFunction } from '@aws-amplify/backend';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });


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
        ADMIN_WHITELIST: process.env.ADMIN_WHITELIST || ''
      }
    })
  }

});
