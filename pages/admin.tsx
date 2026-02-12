import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>({
    authMode: "userPool",
});

export const DEFAULT_CHATBOT_CONTEXT = `
[Explanation of what Blue Cat Tarot is and tarot in general]
[Brief Description of various offerings]
[Chris Wolfgang's background and experience]

Details:
- [Key fact about this context]
- [Another key fact]
- [More relevant details]
`;

export const DEFAULT_SYSTEM_PROMPT = `You are the AI Assistant for {{name}}.
Your goal is to answer questions using the provided CONTEXT_DATA.

Guidelines:
1. Be helpful, friendly, and concise.
2. If asked something not in the context, politely say you don't have that information.
3. Do not make up facts.

CONTEXT_DATA:
{{context}}`;

function AdminDashboard({ signOut, user }: { signOut?: () => void; user?: any }) {
    const [activeTab, setActiveTab] = useState<'keys' | 'context'>('keys');

    // Keys State
    const [keys, setKeys] = useState<Array<Schema["AccessKey"]["type"]>>([]);
    const [newName, setNewName] = useState("");
    const [newLimit, setNewLimit] = useState(10);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editLimit, setEditLimit] = useState<number>(10);

    // Context State
    const [contextName, setContextName] = useState("Chris Wolfgang");
    const [chatbotContext, setChatbotContext] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [isSavingContext, setIsSavingContext] = useState(false);
    const [contextMessage, setContextMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchKeys();
        fetchChatbotContext();
    }, []);

    const fetchKeys = async () => {
        try {
            const { data } = await client.models.AccessKey.list();
            setKeys(data);
        } catch (err) {
            console.error("Error fetching keys:", err);
        }
    };

    const fetchChatbotContext = async () => {
        try {
            const { data, errors } = await client.models.ChatbotContext.get({ id: "main" });
            if (errors) throw errors;
            if (data) {
                setContextName(data.name || "Chris Wolfgang");
                setChatbotContext(data.content);
                setSystemPrompt(data.systemPrompt || DEFAULT_SYSTEM_PROMPT);
            } else {
                setContextName("Chris Wolfgang");
                setChatbotContext(DEFAULT_CHATBOT_CONTEXT.trim());
                setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
            }
        } catch (err) {
            console.error("Error fetching chatbot context:", err);
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

    const handleSaveContext = async () => {
        setIsSavingContext(true);
        setContextMessage(null);
        try {
            const { data } = await client.models.ChatbotContext.get({ id: "main" });

            if (data) {
                await client.models.ChatbotContext.update({
                    id: "main",
                    name: contextName,
                    content: chatbotContext,
                    systemPrompt: systemPrompt
                });
            } else {
                await client.models.ChatbotContext.create({
                    id: "main",
                    name: contextName,
                    content: chatbotContext,
                    systemPrompt: systemPrompt
                });
            }
            setContextMessage({ text: "Context data saved successfully!", type: 'success' });
        } catch (err) {
            console.error("Error saving context data:", err);
            setContextMessage({ text: "Failed to save context data.", type: 'error' });
        } finally {
            setIsSavingContext(false);
        }
    };

    return (
        <main className="admin-container">
            <div className="admin-header">
                <div className="admin-header-content">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p style={{ fontSize: "0.9em", opacity: 0.7, marginTop: "4px" }}>Logged in as: {user?.signInDetails?.loginId}</p>
                    </div>

                    <button onClick={signOut} className="admin-button secondary">Sign Out</button>
                </div>
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'keys' ? 'active' : ''}`}
                        onClick={() => setActiveTab('keys')}
                    >
                        <span>🔑</span> Access Keys
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'context' ? 'active' : ''}`}
                        onClick={() => setActiveTab('context')}
                    >
                        <span>📝</span> Chatbot Context
                    </button>
                </div>
            </div>

            {
                activeTab === 'keys' ? (
                    <>
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
                    </>
                ) : (
                    <section className="admin-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}><span>📝</span> Edit Chatbot Grounding Data</h2>
                            <button
                                onClick={handleSaveContext}
                                disabled={isSavingContext}
                                className="admin-button primary"
                            >
                                {isSavingContext ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                        {contextMessage && (
                            <div className={`status-message ${contextMessage.type}`} style={{
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                background: contextMessage.type === 'success' ? 'rgba(86, 190, 224, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                                color: contextMessage.type === 'success' ? 'var(--palette-primary)' : '#ff4d4d',
                                border: `1px solid ${contextMessage.type === 'success' ? 'var(--palette-primary)' : '#ff4d4d'}`
                            }}>
                                {contextMessage.text}
                            </div>
                        )}

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                            This data is used as the System Instruction for Gemini. Updates here will immediately change how the AI answers questions based on this context.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Chatbot Identity Name</label>
                            <input
                                value={contextName}
                                onChange={(e) => setContextName(e.target.value)}
                                className="admin-input"
                                style={{ width: '100%', maxWidth: '400px' }}
                                placeholder="Identity Name"
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>System Instruction Prompt</label>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Use <code>{"{{name}}"}</code> and <code>{"{{context}}"}</code> as placeholders for the name and context content.
                            </p>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="admin-input"
                                style={{
                                    width: '100%',
                                    minHeight: '200px',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.5',
                                    resize: 'vertical'
                                }}
                                placeholder="Enter system instructions..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Chatbot Context (Markdown)</label>
                            <textarea
                                value={chatbotContext}
                                onChange={(e) => setChatbotContext(e.target.value)}
                                className="admin-input"
                                style={{
                                    width: '100%',
                                    minHeight: '500px',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.5',
                                    resize: 'vertical'
                                }}
                                placeholder="Enter context data in markdown format..."
                            />
                        </div>
                    </section>
                )
            }
            <style jsx>{`
                .admin-container {
                    padding: 40px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .admin-header {
                    margin-bottom: 40px;
                }
                .admin-header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 30px;
                }
                .admin-tabs {
                    display: flex;
                    gap: 10px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 0;
                }
                .admin-tab {
                    padding: 12px 24px;
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    font-size: 1rem;
                }
                .admin-tab:hover {
                    color: var(--text-primary);
                    background: var(--palette-neutral);
                }
                .admin-tab.active {
                    color: var(--palette-secondary);
                    border-bottom-color: var(--palette-secondary);
                }
                .admin-section {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 20px var(--shadow-color);
                }
                .admin-section h2 {
                    margin-top: 0;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.5rem;
                }
                .create-key-form {
                    display: flex;
                    gap: 15px;
                }
                .admin-input {
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--palette-neutral);
                    color: var(--text-primary);
                    font-size: 1rem;
                }
                .admin-input:focus {
                    outline: none;
                    border-color: var(--palette-secondary);
                    box-shadow: 0 0 0 2px var(--palette-accent);
                }
                .admin-button {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    font-size: 0.95rem;
                }
                .admin-button.primary {
                    background: var(--palette-secondary);
                    color: white;
                }
                .admin-button.secondary {
                    background: var(--palette-neutral);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }
                .admin-button.danger {
                    background: #ff4d4d;
                    color: white;
                }
                .admin-button.small {
                    padding: 6px 12px;
                    font-size: 0.85rem;
                }
                .admin-button:hover:not(:disabled) {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }
                .admin-button:active:not(:disabled) {
                    transform: translateY(0);
                }
                .admin-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .admin-table-container {
                    overflow-x: auto;
                }
                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .admin-table th {
                    padding: 15px;
                    border-bottom: 2px solid var(--border-color);
                    color: var(--text-secondary);
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    letter-spacing: 0.05em;
                }
                .admin-table td {
                    padding: 15px;
                    border-bottom: 1px solid var(--border-color);
                }
                code {
                    background: var(--palette-neutral);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.9rem;
                    color: var(--palette-secondary);
                }
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .status-badge.active {
                    background: rgba(86, 190, 224, 0.1);
                    color: var(--palette-primary);
                }
                .status-badge.inactive {
                    background: rgba(158, 158, 158, 0.1);
                    color: #9e9e9e;
                }
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .action-group {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .admin-link {
                    color: var(--palette-secondary);
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .admin-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </main >
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
