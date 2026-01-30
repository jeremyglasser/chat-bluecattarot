import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Authenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>({
    authMode: "userPool",
});

function AdminDashboard({ signOut, user }: { signOut?: () => void; user?: any }) {
    const [keys, setKeys] = useState<Array<Schema["AccessKey"]["type"]>>([]);
    const [newName, setNewName] = useState("");
    const [newLimit, setNewLimit] = useState(10);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const { data } = await client.models.AccessKey.list();
            setKeys(data);
        } catch (err) {
            console.error("Error fetching keys:", err);
        }
    };

    const generateRandomKey = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    };

    const createKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;

        const generatedKey = generateRandomKey();

        await client.models.AccessKey.create({
            key: generatedKey,
            name: newName,
            maxUsage: newLimit,
            usageCount: 0,
            isActive: true,
        });

        setNewName("");
        fetchKeys();
    };

    const toggleKey = async (key: string, isActive: boolean) => {
        await client.models.AccessKey.update({
            key,
            isActive: !isActive,
        });
        fetchKeys();
    };

    const deleteKey = async (key: string) => {
        if (!confirm("Are you sure?")) return;
        await client.models.AccessKey.delete({ key });
        fetchKeys();
    };

    return (
        <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Access Key Management</h1>
                <button onClick={signOut} style={{ background: "var(--palette-primary)", fontSize: "0.8em" }}>Sign Out</button>
            </div>
            <p style={{ fontSize: "0.9em", opacity: 0.7 }}>Logged in as: {user?.signInDetails?.loginId}</p>

            <section style={{ marginBottom: "40px", padding: "20px", background: "rgba(0,0,0,0.05)", borderRadius: "8px", marginTop: "20px" }}>
                <h2>Create New Key</h2>
                <form onSubmit={createKey} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input
                        placeholder="Recipient Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                    <input
                        type="number"
                        placeholder="Limit"
                        value={newLimit}
                        onChange={(e) => setNewLimit(parseInt(e.target.value))}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "80px" }}
                    />
                    <button type="submit" style={{ background: "var(--palette-secondary)" }}>Create</button>
                </form>
            </section>

            <section>
                <h2>Existing Keys</h2>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
                            <th style={{ padding: "16px 8px" }}>Key</th>
                            <th style={{ padding: "16px 8px" }}>Name</th>
                            <th style={{ padding: "16px 8px" }}>Usage</th>
                            <th style={{ padding: "16px 8px" }}>Status</th>
                            <th style={{ padding: "16px 8px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((k) => (
                            <tr key={k.key} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "16px 8px" }}><code>{k.key}</code></td>
                                <td style={{ padding: "16px 8px" }}>{k.name}</td>
                                <td style={{ padding: "16px 8px" }}>{k.usageCount} / {k.maxUsage}</td>
                                <td style={{ padding: "16px 8px" }}>{k.isActive ? "✅ Active" : "❌ Inactive"}</td>
                                <td style={{ padding: "16px 8px" }}>
                                    <button onClick={() => toggleKey(k.key, !!k.isActive)} style={{ fontSize: "0.8em", marginRight: "8px" }}>
                                        {k.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <button onClick={() => deleteKey(k.key)} style={{ fontSize: "0.8em", background: "#ff4d4d", marginRight: "8px" }}>
                                        Delete
                                    </button>
                                    <a href={`/?key=${k.key}`} target="_blank" style={{ fontSize: "0.8em", color: "var(--palette-secondary)", textDecoration: "underline" }}>
                                        View Link
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}

export default function AdminPage() {
    return (
        <Authenticator>
            {({ signOut, user }) => (
                <AdminDashboard signOut={signOut} user={user} />
            )}
        </Authenticator>
    );
}
