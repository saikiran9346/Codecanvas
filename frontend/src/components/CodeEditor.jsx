import React, { useState, useEffect, useCallback, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { dracula } from '@uiw/codemirror-theme-dracula';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { LANGUAGE_VERSIONS, CODE_SNIPPETS } from "./constants";
import LanguageSelector from "./LanguageSelector";
import "./CodeEditor.css";

// Default judge URL if environment variable is not set
const DEFAULT_JUDGE_URL = "https://emkc.org/api/v2/piston/execute";
const APP_NAME = "CodeCanvas IDE";

const languageExtensions = {
  cpp: cpp,
  python: python,
  javascript: javascript,
  java: java,
};

export default function CodeEditor({
  value,
  onChange,
  inputValue,
  onInputChange,
}) {
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentColumn, setCurrentColumn] = useState(1);

  // Get judge URL from environment or use default
  const getJudgeUrl = () => {
    const envUrl = import.meta.env.VITE_JUDGE;
    console.log("Environment Judge URL:", envUrl); // Debug log
    return envUrl || DEFAULT_JUDGE_URL;
  };

  // Set default snippet when language changes
  useEffect(() => {
    if (CODE_SNIPPETS[language]) {
      onChange(CODE_SNIPPETS[language]);
    }
  }, [language, onChange]);

  // Track cursor position
  const onCursorActivity = useCallback((view) => {
    const { from } = view.state.selection.main;
    const lines = view.state.doc.toString().slice(0, from).split("\n");
    setCurrentLine(lines.length);
    setCurrentColumn(lines[lines.length - 1].length + 1);
  }, []);

  const runCode = useCallback(async () => {
    if (!value.trim()) {
      setOutput("No code to run");
      return;
    }
    setIsRunning(true);
    setOutput("Running...");
    try {
      const response = await fetch(import.meta.env.VITE_JUDGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          version: LANGUAGE_VERSIONS[language],
          files: [{ content: value.trim() }],
          stdin: inputValue,
        })
      });
      const data = await response.json();
      const result = data.run?.output || "No output";
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [value, inputValue, language]);

  const clearOutput = useCallback(() => {
    setOutput("");
  }, []);

  return (
    <div className={`editor-container dark`}> 
      <div className="editor-header">
        <div className="header-left">
          <div className="cursor-position">
            Line {currentLine}, Column {currentColumn}
          </div>
        </div>
        <div className="header-right">
          <div className="editor-actions-group">
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <button
              onClick={runCode}
              className={`run-btn ${isRunning ? "running" : ""}`}
              disabled={isRunning}
              title="Run code"
            >
              {isRunning ? "⏳ Running..." : "▶️ Run"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="editor-main">
        <CodeMirror
          value={value}
          height="500px"
          theme={dracula}
          extensions={[
            languageExtensions[language] && languageExtensions[language](),
          ].filter(Boolean)}
          onChange={(val, viewUpdate) => {
            onChange(val);
            onCursorActivity(viewUpdate.view);
          }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            autocompletion: true,
            syntaxHighlighting: true,
          }}
          style={{ fontFamily: 'Fira Code, monospace' }}
        />
      </div>
      <div className="io-section">
        <div className="input-panel">
          <div className="panel-header">
            <h3>Input</h3>
            <button
              onClick={() => onInputChange("")}
              className="clear-btn"
              title="Clear input"
            >
              Clear
            </button>
          </div>
          <textarea
            className="input-textarea"
            rows="6"
            placeholder="Enter input for your program..."
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
          />
        </div>
        <div className="output-panel">
          <div className="panel-header">
            <h3>Output</h3>
            <button
              onClick={clearOutput}
              className="clear-btn"
              title="Clear output"
            >
              Clear
            </button>
          </div>
          <pre 
            className={`output-content ${isRunning ? "running" : ""}`}
          >
            {output || "Output will appear here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
