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
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editLimit, setEditLimit] = useState<number>(10);

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

    const updateLimit = async (key: string) => {
        await client.models.AccessKey.update({
            key,
            maxUsage: editLimit,
        });
        setEditingKey(null);
        fetchKeys();
    };

    const startEditing = (key: string, currentLimit: number) => {
        setEditingKey(key);
        setEditLimit(currentLimit);
    };

    return (
        <main className="admin-container">
            <div className="admin-header">
                <div>
                    <h1>Access Key Management</h1>
                    <p style={{ fontSize: "0.9em", opacity: 0.7, marginTop: "4px" }}>Logged in as: {user?.signInDetails?.loginId}</p>
                </div>
                <button onClick={signOut} className="admin-button secondary">Sign Out</button>
            </div>

            <section className="admin-section">
                <h2><span>🆕</span> Create New Key</h2>
                <form onSubmit={createKey} className="create-key-form">
                    <input
                        placeholder="Recipient Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="admin-input"
                    />
                    <input
                        type="number"
                        placeholder="Limit"
                        value={newLimit}
                        onChange={(e) => setNewLimit(parseInt(e.target.value))}
                        className="admin-input"
                        style={{ width: "100px" }}
                    />
                    <button type="submit" className="admin-button primary">Create Key</button>
                </form>
            </section>

            <section className="admin-section">
                <h2><span>🔑</span> Existing Keys</h2>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Key</th>
                                <th>Name</th>
                                <th>Usage</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((k) => (
                                <tr key={k.key}>
                                    <td><code>{k.key}</code></td>
                                    <td>{k.name}</td>
                                    <td>
                                        {k.usageCount} / {editingKey === k.key ? (
                                            <input
                                                type="number"
                                                value={editLimit}
                                                onChange={(e) => setEditLimit(parseInt(e.target.value))}
                                                className="admin-input"
                                                style={{ width: "70px", padding: "4px 8px" }}
                                                onKeyDown={(e) => e.key === 'Enter' && updateLimit(k.key)}
                                                autoFocus
                                            />
                                        ) : (
                                            k.maxUsage
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${k.isActive ? 'active' : 'inactive'}`}>
                                            {k.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <div className="action-group">
                                                {editingKey === k.key ? (
                                                    <>
                                                        <button onClick={() => updateLimit(k.key)} className="admin-button primary small">
                                                            Save
                                                        </button>
                                                        <button onClick={() => setEditingKey(null)} className="admin-button secondary small">
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEditing(k.key, k.maxUsage || 0)} className="admin-button secondary small">
                                                            Edit Limit
                                                        </button>
                                                        <button onClick={() => toggleKey(k.key, !!k.isActive)} className="admin-button secondary small">
                                                            {k.isActive ? "Deactivate" : "Activate"}
                                                        </button>
                                                        <button onClick={() => deleteKey(k.key)} className="admin-button danger small">
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <a href={`/?key=${k.key}`} target="_blank" className="admin-link">
                                                View Link
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
