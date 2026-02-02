import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useRouter } from "next/router";
import ProfilePage from "@/components/ProfilePage";

const client = generateClient<Schema>({
    authMode: "apiKey",
});

export default function ResumePage() {
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
                setErrorMsg("A valid access key is required in the URL to view this resume.");
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

                // Increment usage count for the specific resume view
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
                <h1 className="error-header">{errorHeader}</h1>
                <p className="error-text">{errorMsg}</p>
                <div className="error-footer">
                    Please contact Jeremy Glasser if you believe this is an error.
                </div>
            </main>
        );
    }

    return (
        <main>
            <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
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
                        marginBottom: '20px',
                        outline: 'none'
                    }}
                >
                    ← Back to Welcome Page
                </button>
            </div>
            <ProfilePage />
            <footer style={{ padding: "40px", textAlign: "center", opacity: 0.5, fontSize: "0.8rem" }}>
                © {new Date().getFullYear()} Jeremy Glasser. Authorized Access Only.
            </footer>
        </main>
    );
}
