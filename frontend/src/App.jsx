import { useContext, useState } from "react";
import { Editor } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ThemeContext } from "./Components/ThemeChange"; // Assuming this is your context
import Button from "./Components/Button";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import "./App.css"; // Import the styles

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);
import Profile from './Components/Profile';
import { ThemeContext } from "./Components/ThemeChange";


export default function CodeReviewer() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext); // Get the current theme

  const handleReview = async () => {
    setLoading(true);
    setReviewData(null);

    try {
      const response = await fetch("http://localhost:5000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setReviewData(data);
    } catch (error) {
      setReviewData({ explanation: "⚠️ Error fetching review. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const chartData = reviewData && {
    labels: Object.keys(reviewData.originalRatings || {}),
    datasets: [
      {
        label: "Original Code",
        data: Object.values(reviewData.originalRatings || {}),
        backgroundColor: "#f87171",
      },
      {
        label: "Improved Code",
        data: Object.values(reviewData.improvedRatings || {}),
        backgroundColor: "#4ade80",
      },
    ],
  };

  return (
// <<<<<<< karthick-dev
    <div className={`container ${theme}`}>
      <button className="theme" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>

    <>
      <Profile/>


    <div className="container">
      {/* <button  className="theme" onClick={toggleTheme} >{theme==="light" ? "🌙" : "☀️"}</button> */}

      <h1>Code Reviewer📌</h1>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={`border p-2 rounded ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}
      >
        <option value="cpp">C++</option>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="others">Others</option>
      </select>

      <div className="editor-container">
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value)}
          theme={theme === "dark" ? "vs-dark" : "vs-light"} // Set Monaco theme based on context
        />
      </div>

      <Button onClick={handleReview}>{loading ? "Reviewing..." : "Review Code"}</Button>

      {loading && <div className="loader"></div>}

      {reviewData && (
        <div className="review-box">
          <ReactMarkdown
            children={reviewData.explanation || "No explanation provided."}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter style={dracula} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>{children}</code>
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

          {chartData && (
            <div className="chart-container">
              <h3>Code Quality Comparison</h3>
              <Bar data={chartData} />
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
