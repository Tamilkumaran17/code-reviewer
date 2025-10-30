import { useContext, useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./App.css";
import Button from "./Components/Button";
import RatingChart from "./Components/RatingChart";
import { ThemeContext } from "./Components/ThemeChange";
import ParticlesBackground from "./Components/ParticlesBackground";
import ScrollToTopButton from "./Components/ScrollToTopButton";

export default function CodeReviewer() {
  const [code, setCode] = useState("// Welcome to Code Reviewer\n// You Can Enter the code and reviwed code...\n");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const reviewRef = useRef(null);
  const [results, setResults] = useState({});
  const [bestAI, setBestAI] = useState("");

  const bestReason = "provided the clearest review and most user-friendly revised code.";

  const handleReview = async () => {
    setLoading(true);
    setResults({});
    setBestAI("");

    try {
      const response = await fetch("http://localhost:5000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setResults(data);

      // Pick best AI (only Gemini and Claude now)
      let best = "gemini";
      let bestScore = 0;
      for (const ai of ["gemini", "openai"]) {
        if (data[ai]?.ratings?.readability > bestScore) {
          best = ai;
          bestScore = data[ai].ratings.readability;
        }
      }
      setBestAI(best);
    } catch (err) {
      console.error("Frontend error:", err);
      alert("Error fetching review. Check server logs.");
    } finally {
      setLoading(false);
      reviewRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleReview();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [code, language]);

  return (
    <>
      <div className="main">
        <ParticlesBackground />
        <ScrollToTopButton />
        <div className="container">
          <h1>Code Reviewer📌</h1>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="others">Others</option>
          </select>

          <div className="editor-container">
            <Editor className="code-editer" language={language} value={code} onChange={(value) => setCode(value)} />
          </div>

          <Button onClick={handleReview} title="cttl + Enter">
            {loading ? "Reviewing..." : "Review Code"}
          </Button>

          {loading && <div className="loader"></div>}
        </div>

        {Object.keys(results).length > 0 && (
          <div className="review-container container" ref={reviewRef}>
            {["gemini", "openai"].map((ai) => (
              <div className="review-box" key={ai}>
                <h2>{ai.toUpperCase()}</h2>

                <ReactMarkdown
                  children={results[ai].review}
                  components={{
                    code({ inline, className, children, ...props }) {
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
                  }}
                />

                <h2>Improved Version:</h2>
                <ReactMarkdown
                  children={results[ai].revisedCode}
                  components={{
                    code({ inline, className, children, ...props }) {
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
                  }}
                />

                <div className="rating-chart-wrapper">
                  <RatingChart ratings={results[ai].ratings} />
                </div>
              </div>
            ))}

            <div className="review-box">
              <h3>🤖 Best Review Suggestion</h3>
              <p>
                <strong>{bestAI}</strong> gave the best review because it {bestReason}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
