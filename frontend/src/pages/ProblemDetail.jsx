import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CodeEditor from "../components/CodeEditor";
import "../styles/ProblemDetail.css";

const ProblemDetail = () => {
  const { titleSlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [input, setInput] = useState(""); 
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript"); 
  const backend = import.meta.env.VITE_BACKEND_URL;
  const LEETCODE_API = `https://leetcode-api-mu.vercel.app/select?titleSlug=${titleSlug}`;

  useEffect(() => {
    const jwtoken = localStorage.getItem("jwtoken");
    if (jwtoken === null || jwtoken === undefined) {
      navigate("/login");
    }
  });

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await axios.get(LEETCODE_API);
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [titleSlug]);

  // Effect to log submissionResult after it's updated
  useEffect(() => {
    console.log("submissionResult state updated:", submissionResult);
    // You could add additional logic here based on the updated state
  }, [submissionResult]); // This effect runs whenever submissionResult changes

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleSubmit = async () => {
    if (!code) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("jwtoken"); // or your token storage method

      if (!token) {
        throw new Error("No authentication token found. Please login.");
      }

      console.log("Submitting solution...", {
        problemSlug: titleSlug,
        code,
        language: selectedLanguage 
      });

      const response = await axios.post(
        `${backend}/api/solutions/submit`,
        {
          problemSlug: titleSlug,
          code,
          language: selectedLanguage, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Submission response:", response.data);
      setSubmissionResult(response.data);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || err.message);
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDiscussions = () => {
    navigate(`/discussions/${titleSlug}`);
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "difficulty-easy";
      case "Medium":
        return "difficulty-medium";
      case "Hard":
        return "difficulty-hard";
      default:
        return "";
    }
  };

  if (loading) {
    return <>Loading...</>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="app-container">
      <div className="main-grid">
        {/* Left Panel - Problem Viewer */}
        <div className="panel">
          {data && (
            <>
              <h1 className="problem-title">{data.questionTitle}</h1>
              <h2 className="difficulty-text">
                Difficulty:{" "}
                <span className={getDifficultyClass(data.difficulty)}>
                  {data.difficulty}
                </span>
              </h2>
              <div
                className="question-content"
                dangerouslySetInnerHTML={{ __html: data.question }}
              />
              <h2 className="sample-tests-title">Sample Test Cases</h2>
              <pre className="sample-tests-box">{data.exampleTestcases}</pre>
              <div className="tags-container">
                Tags:{" "}
                {data.topicTags.map((tag) => (
                  <span key={tag.name} className="tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="panel">
          <CodeEditor
            value={code}
            onChange={setCode}
            inputValue={input} // Pass input value
            onInputChange={setInput} // Pass input change handler
            language={selectedLanguage} // Pass selected language
            onLanguageChange={setSelectedLanguage} // Pass language change handler
          />
          <div className="action-buttons">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </button>
            <button
              onClick={() => navigate(`/solutions/${titleSlug}`)}
              className="solutions-button"
            >
              View Solutions
            </button>
            <button
              onClick={handleViewDiscussions}
              className="discussions-button"
            >
              View Discussions
            </button>
          </div>
          {submissionResult && (
            <div className={`submission-result ${submissionResult.passed ? "success" : "error"}`}>
              <h3>Submission Result</h3>
              <p>{submissionResult.message}</p>
              {console.log("Submission Result Test Cases:", submissionResult.testResults)}
              {submissionResult.testResults && (
                <div className="test-results">
                  <h4>Test Cases:</h4>
                  {submissionResult.testResults.map((result, index) => (
                    <div key={index} className={`test-case ${result.passed ? "passed" : "failed"}`}>
                      <div className="test-case-header">
                        <span className="test-case-number">Test Case {index + 1}</span>
                        <span className={`test-case-status ${result.passed ? "passed" : "failed"}`}>
                          {result.passed ? "✓ Passed" : "✗ Failed"}
                        </span>
                      </div>
                      <div className="test-case-details">
                        <div className="test-case-input">
                          <strong>Input:</strong>
                          <pre>{result.input}</pre>
                        </div>
                        <div className="test-case-output">
                          <strong>Output:</strong>
                          <pre>{result.output}</pre>
                        </div>
                        {result.expected && (
                          <div className="test-case-expected">
                            <strong>Expected:</strong>
                            <pre>{result.expected}</pre>
                          </div>
                        )}
                        {result.error && (
                          <div className="test-case-error">
                            <strong>Error:</strong>
                            <pre>{result.error}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
