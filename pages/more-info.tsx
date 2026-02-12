import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";

const client = generateClient<Schema>({
    authMode: "apiKey",
});

export default function MoreInfoPage() {
    const router = useRouter();
    const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
    const [errorHeader, setErrorHeader] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [contextName, setContextName] = useState<string>("Chris Wolfgang");
    const [contextContent, setContextContent] = useState<string>("");

    useEffect(() => {
        if (!router.isReady) return;

        const validateKey = async () => {
            const { key } = router.query;

            if (!key || typeof key !== "string") {
                setAccessGranted(false);
                setErrorHeader("Access Denied");
                setErrorMsg("A valid access key is required in the URL to view this information.");
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

                // Fetch dynamic data
                const { data: config } = await client.models.ChatbotContext.get({ id: "main" });
                if (config) {
                    if (config.name) setContextName(config.name);
                    setContextContent(config.content);
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
        <main style={{ minHeight: '100vh', background: 'var(--palette-neutral)' }}>
            <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <button
                    onClick={() => router.push({ pathname: '/', query: { key: router.query.key } })}
                    className="admin-link"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '40px',
                        outline: 'none'
                    }}
                >
                    ← Back to Chat
                </button>

                <div className="welcome-card" style={{ padding: '40px', textAlign: 'left' }}>
                    <h1 style={{ marginBottom: '30px', borderBottom: '2px solid var(--palette-secondary)', paddingBottom: '10px' }}>
                        {contextName} - Detailed Context
                    </h1>

                    <div className="markdown-content">
                        <ReactMarkdown>{contextContent}</ReactMarkdown>
                    </div>
                </div>
            </div>

            <footer style={{ padding: "40px", textAlign: "center", opacity: 0.5, fontSize: "0.8rem" }}>
                © {new Date().getFullYear()} {contextName}. Authorized Access Only.
            </footer>

            <style jsx global>{`
                .markdown-content {
                    line-height: 1.6;
                    color: var(--text-primary);
                }
                .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                    margin-top: 2em;
                    margin-bottom: 1em;
                    color: var(--palette-secondary);
                }
                .markdown-content p {
                    margin-bottom: 1em;
                }
                .markdown-content ul, .markdown-content ol {
                    margin-bottom: 1em;
                    padding-left: 2em;
                }
                .markdown-content li {
                    margin-bottom: 0.5em;
                }
                .markdown-content code {
                    background: var(--palette-neutral);
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-family: monospace;
                }
            `}</style>
        </main>
    );
}
