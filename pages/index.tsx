import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useRouter } from "next/router";

const client = generateClient<Schema>({
  authMode: "apiKey",
});

export default function App() {
  const router = useRouter();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
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
        listTodos();
      } catch (err) {
        console.error("Error validating key:", err);
        setAccessGranted(false);
        setErrorHeader("System Error");
        setErrorMsg("An error occurred while validating your access key.");
      }
    };

    validateKey();
  }, [router.isReady, router.query]);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  if (accessGranted === null) {
    return (
      <main>
        <h1>Verifying Access...</h1>
      </main>
    );
  }

  if (accessGranted === false) {
    return (
      <main>
        <h1 style={{ color: "var(--palette-secondary)" }}>{errorHeader}</h1>
        <p>{errorMsg}</p>
        <div style={{ marginTop: "20px", fontSize: "0.8em", opacity: 0.7 }}>
          Please contact the administrator if you believe this is an error.
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 Access granted! You are viewing this site as an authorized user.
        <br />
        <a href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/">
          Review next steps of this tutorial.
        </a>
      </div>
    </main>
  );
}
