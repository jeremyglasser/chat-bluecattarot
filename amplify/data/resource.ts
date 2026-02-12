import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  AccessKey: a
    .model({
      key: a.string().required(),
      name: a.string().required(),
      usageCount: a.integer().default(0),
      maxUsage: a.integer().default(100),
      isActive: a.boolean().default(true),
    })
    .identifier(["key"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read", "update"]),
      allow.authenticated(),
    ]),

  ChatbotContext: a
    .model({
      id: a.string().required(),
      name: a.string(),
      content: a.string().required(),
      systemPrompt: a.string(),
    })
    .identifier(["id"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.authenticated(),
    ]),

  ChatMessage: a
    .model({
      accessKey: a.string().required(),
      role: a.string().required(), // 'user' | 'assistant'
      content: a.string().required(),
    })
    .secondaryIndexes((index) => [index("accessKey")])
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
