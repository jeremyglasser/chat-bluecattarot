import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>({
    authMode: "userPool",
});

export const DEFAULT_RESUME = `
[Your Name]
[Current Title]

Summary:
[Your Name] is a very trustworthy and reliable person who is passionate about building great products.

Experience:
- [Company Name] ([Start Date] - [End Date]): [Your Title]
  - [Description of your responsibilities and accomplishments]

Skills:
- [List your skills]

Education:
- [Your Education]

Certifications:
- [Your Certifications]
`;

function AdminDashboard({ signOut, user }: { signOut?: () => void; user?: any }) {
    const [activeTab, setActiveTab] = useState<'keys' | 'resume'>('keys');

    // Keys State
    const [keys, setKeys] = useState<Array<Schema["AccessKey"]["type"]>>([]);
    const [newName, setNewName] = useState("");
    const [newLimit, setNewLimit] = useState(10);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editLimit, setEditLimit] = useState<number>(10);

    // Resume State
    const [resumeName, setResumeName] = useState("Jeremy Glasser");
    const [resumeContent, setResumeContent] = useState("");
    const [isSavingResume, setIsSavingResume] = useState(false);
    const [resumeMessage, setResumeMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchKeys();
        fetchResumeData();
    }, []);

    const fetchKeys = async () => {
        try {
            const { data } = await client.models.AccessKey.list();
            setKeys(data);
        } catch (err) {
            console.error("Error fetching keys:", err);
        }
    };

    const fetchResumeData = async () => {
        try {
            const { data, errors } = await client.models.ResumeConfig.get({ id: "main" });
            if (errors) throw errors;
            if (data) {
                setResumeName(data.name || "Jeremy Glasser");
                setResumeContent(data.content);
            } else {
                setResumeName("Jeremy Glasser");
                setResumeContent(DEFAULT_RESUME.trim());
            }
        } catch (err) {
            console.error("Error fetching resume data:", err);
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

    const handleSaveResume = async () => {
        setIsSavingResume(true);
        setResumeMessage(null);
        try {
            const { data } = await client.models.ResumeConfig.get({ id: "main" });

            if (data) {
                await client.models.ResumeConfig.update({
                    id: "main",
                    name: resumeName,
                    content: resumeContent
                });
            } else {
                await client.models.ResumeConfig.create({
                    id: "main",
                    name: resumeName,
                    content: resumeContent
                });
            }
            setResumeMessage({ text: "Resume data saved successfully!", type: 'success' });
        } catch (err) {
            console.error("Error saving resume data:", err);
            setResumeMessage({ text: "Failed to save resume data.", type: 'error' });
        } finally {
            setIsSavingResume(false);
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
                        className={`admin-tab ${activeTab === 'resume' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resume')}
                    >
                        <span>📝</span> Resume Content
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
                            <h2 style={{ margin: 0 }}><span>📝</span> Edit AI Grounding Data</h2>
                            <button
                                onClick={handleSaveResume}
                                disabled={isSavingResume}
                                className="admin-button primary"
                            >
                                {isSavingResume ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                        {resumeMessage && (
                            <div className={`status-message ${resumeMessage.type}`} style={{
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                background: resumeMessage.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                color: resumeMessage.type === 'success' ? '#4caf50' : '#f44336',
                                border: `1px solid ${resumeMessage.type === 'success' ? '#4caf50' : '#f44336'}`
                            }}>
                                {resumeMessage.text}
                            </div>
                        )}

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                            This data is used as the System Instruction for Gemini. Updates here will immediately change how the AI answers questions about your background.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Professional Name</label>
                            <input
                                value={resumeName}
                                onChange={(e) => setResumeName(e.target.value)}
                                className="admin-input"
                                style={{ width: '100%', maxWidth: '400px' }}
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Resume Content (Markdown)</label>
                            <textarea
                                value={resumeContent}
                                onChange={(e) => setResumeContent(e.target.value)}
                                className="admin-input"
                                style={{
                                    width: '100%',
                                    minHeight: '600px',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.5',
                                    resize: 'vertical'
                                }}
                                placeholder="Enter resume data in markdown format..."
                            />
                        </div>
                    </section>
                )
            }
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
