## AWS Amplify Next.js (Pages) Starter Template

This repository provides a starter template for creating applications using Next.js (Pages) and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Overview

This template equips you with a foundational Next.js application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Local Development

### 1. Prerequisites
Ensure you have the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured with your credentials.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Amplify Sandbox
The sandbox provides an isolated backend environment for your local development.
```bash
npx ampx sandbox
```

### 4. Configure Secrets
For backend functions (like the Auth pre-sign-up trigger) and the bridged environment in production, you must set your secrets in the Amplify Secret Store. Run these commands in your terminal:

```bash
# Required for the AI Chat API
npx ampx sandbox secret set GEMINI_API_KEY
npx ampx sandbox secret set GEMINI_MODEL

# Required for Admin access control
npx ampx sandbox secret set ADMIN_WHITELIST

# Optional / Project Metadata
npx ampx sandbox secret set GEMINI_PROJECT_NUMBER
```

> **Note**: When prompted, paste the corresponding values from your `.env.local` file. This securely stores the values in AWS SSM Parameter Store so your Lambda functions can access them.

### 5. Running the Frontend
Once the sandbox is running and secrets are set, start the Next.js dev server:
```bash
npm run dev
```
The app will be available at `http://localhost:3003`.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.