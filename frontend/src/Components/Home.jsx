import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

export default function CodeReviewer() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState("");

  const handleReview = async () => {
    const response = await fetch("http://localhost:5000/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language })
    });
    const data = await response.json();
    setReview(data.feedback);
  };


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">AI Code Reviewer</h1>
      <select
        className="border p-2 rounded"
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
      {review && <div className="p-4 border mt-4 rounded bg-gray-100">{review}</div>}
    </div>
  );
}
