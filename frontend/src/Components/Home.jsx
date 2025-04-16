import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

export default function CodeReviewer() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState("");
  const [improvedCode, setImprovedCode] = useState("");

  const handleReview = async () => {
    const response = await fetch("http://localhost:5000/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language })
    });
    const data = await response.json();
    setReview(data.explanation || data.feedback);
    setImprovedCode(data.improvedCode || "");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">AI Code Reviewer</h1>
      <select
        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
      />

      <Button onClick={handleReview}>Review Code</Button>

      {review && (
        <div className="p-4 border mt-4 rounded bg-gray-100 dark:bg-gray-800 dark:text-white">
          <h2 className="text-lg font-semibold mb-2">Analysis</h2>
          <div dangerouslySetInnerHTML={{ __html: review }} />
        </div>
      )}

      {improvedCode && (
        <div className="p-4 border mt-4 rounded bg-gray-50 dark:bg-gray-900 dark:text-white">
          <h2 className="text-lg font-semibold mb-2">Improved Code</h2>
          <pre className="whitespace-pre-wrap">
            <code>{improvedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
