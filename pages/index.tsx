import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useRouter } from "next/router";
import { ChatInterface } from "@/components/ChatInterface";

const client = generateClient<Schema>({
  authMode: "apiKey",
});

export default function App() {
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [errorHeader, setErrorHeader] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [contextName, setContextName] = useState<string>("Chris Wolfgang");

  useEffect(() => {
    if (!router.isReady) return;

    const validateKey = async () => {
      const { key } = router.query;

      if (!key || typeof key !== "string") {
        setAccessGranted(false);
        setErrorHeader("Access Denied");
        setErrorMsg("A valid access key is required in the URL (e.g., ?key=YOUR_KEY).");
        return;
      }

      try {
        const { data: accessKey, errors } = await client.models.AccessKey.get({ key });

        if (errors || !accessKey) {
          setAccessGranted(false);
          setErrorHeader("Invalid Key");
          setErrorMsg("The access key provided is not valid.");
          return;
        }

        if (!accessKey.isActive) {
          setAccessGranted(false);
          setErrorHeader("Key Inactive");
          setErrorMsg("This access key has been deactivated.");
          return;
        }

        const currentUsage = accessKey.usageCount || 0;
        const limit = accessKey.maxUsage || 100;

        if (currentUsage >= limit) {
          setAccessGranted(false);
          setErrorHeader("Usage Limit Reached");
          setErrorMsg("This access key has reached its maximum usage limit.");
          return;
        }

        // Increment usage count
        await client.models.AccessKey.update({
          key: accessKey.key,
          usageCount: currentUsage + 1,
        });

        // Fetch dynamic name if available
        const { data: config } = await client.models.ChatbotContext.get({ id: "main" });
        if (config?.name) {
          setContextName(config.name);
        }

        setAccessGranted(true);
      } catch (err) {
        console.error("Error validating key:", err);
        setAccessGranted(false);
        setErrorHeader("System Error");
        setErrorMsg("An error occurred while validating your access key.");
      }
    };

    validateKey();
  }, [router.isReady, router.query]);

  if (accessGranted === null) {
    return (
      <main className="status-container">
        <h1>Verifying Access...</h1>
        <p>Please wait while we validate your secure key.</p>
      </main>
    );
  }

  if (accessGranted === false) {
    return (
      <main className="status-container">
        <h1 className="error-header">{errorHeader}</h1>
        <p className="error-text">{errorMsg}</p>
        <div className="error-footer">
          Please contact {contextName} if you believe this is an error.
        </div>
      </main>
    );
  }

  return (
    <main className="status-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Welcome</h1>
        <p className="welcome-text">
          You have been granted exclusive access to this interactive chatbot.
          Feel free to ask questions and explore the context provided below.
        </p>

        <ChatInterface name={contextName} accessKey={router.query.key as string} />

        <button
          onClick={() => router.push({ pathname: '/more-info', query: { key: router.query.key } })}
          className="cta-button"
        >
          Learn More
        </button>
      </div>

      <footer className="welcome-footer">
        Authorized access for key: <code>{router.query.key}</code>
      </footer>
    </main>
  );
}
