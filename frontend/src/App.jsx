import { useContext, useState } from "react";
import { Editor } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./App.css";
import Button from "./Components/Button";
import Profile from './Components/Profile';
import RatingChart from "./Components/RatingChart";
import { ThemeContext } from "./Components/ThemeChange";

export default function CodeReviewer() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const {theme, toggleTheme} = useContext(ThemeContext);

  const handleReview = async () => {

    setLoading(true); 
    setReview("");

    try {
      const response = await fetch("http://localhost:5000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setReview(data.review);
    } catch (error) {
      setReview("⚠️ Error fetching review. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
      <Profile/>

      <div className="main">


<div className="container">
  {/* <button  className="theme" onClick={toggleTheme} >{theme==="light" ? "🌙" : "☀️"}</button> */}

  <h1>Code Reviewer📌</h1>

  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
    <option value="cpp">C++</option>
    <option value="javascript">JavaScript</option>
    <option value="python">Python</option>
    <option value="java">Java</option>
    <option value="others">Others</option>

  </select>

  <div className="editor-container">
    <Editor height="400px" language={language} value={code} onChange={(value) => setCode(value)} />
  </div>

  <Button onClick={handleReview}>{loading ? "Reviewing..." : "Review Code"}</Button>

  {loading && <div className="loader"></div>}

  {review && (
    <div className="review-box">
      <ReactMarkdown
        children={review}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter style={dracula} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          strong({ children }) {
            return <strong style={{ color: "#0056b3" }}>{children}</strong>; 
          },
          ul({ children }) {
            return <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>{children}</ul>; 
          },
          li({ children }) {
            return <li style={{ marginBottom: "5px" }}>{children}</li>; 
          },
          p({ children }) {
            return <p style={{ marginBottom: "10px" }}>{children}</p>; 
          },
        }}
      />
    </div>
  )}
      </div>
          <div className="graph">
            <h3 style={{'text-align':'center'}}>Review Rating</h3>
            <RatingChart/>
          </div>
      </div>
    </>
  );
}
