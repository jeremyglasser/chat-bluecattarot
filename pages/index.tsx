import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useRouter } from "next/router";
import ProfilePage from "@/components/ProfilePage";

const client = generateClient<Schema>({
  authMode: "apiKey",
});

export default function App() {
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [errorHeader, setErrorHeader] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

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
        <h1 style={{ color: "var(--palette-secondary)", fontSize: "2.5rem" }}>{errorHeader}</h1>
        <p style={{ maxWidth: "500px", margin: "20px 0" }}>{errorMsg}</p>
        <div style={{ marginTop: "20px", fontSize: "0.9rem", opacity: 0.6 }}>
          Please contact Jeremy Glasser if you believe this is an error.
        </div>
      </main>
    );
  }

  return (
    <main className="status-container" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{
        maxWidth: '700px',
        padding: '60px',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(26, 34, 56, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--palette-primary)' }}>Welcome</h1>
        <p style={{ fontSize: '1.25rem', color: '#555', marginBottom: '40px', lineHeight: '1.6' }}>
          Thank you for your interest in my professional background.
          You have been granted exclusive access to view my detailed resume and career highlights.
        </p>

        <button
          onClick={() => router.push({ pathname: '/resume', query: { key: router.query.key } })}
          style={{
            background: 'var(--palette-primary)',
            color: 'white',
            padding: '18px 40px',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 20px rgba(26, 34, 56, 0.2)'
          }}
          className="cta-button"
        >
          View Professional Resume
        </button>
      </div>

      <footer style={{ marginTop: '40px', opacity: 0.5, fontSize: '0.9rem' }}>
        Authorized access for key: <code>{router.query.key}</code>
      </footer>

      <style jsx>{`
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(26, 34, 56, 0.3);
          background: var(--palette-secondary);
        }
      `}</style>
    </main>
  );
}
