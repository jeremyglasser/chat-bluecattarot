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

  ResumeConfig: a
    .model({
      id: a.string().required(),
      name: a.string(),
      content: a.string().required(),
    })
    .identifier(["id"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
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
