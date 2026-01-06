import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import '../styles/CodeEditorPage.css';

function CodeEditorPage() {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');

  return (
    <div className="code-editor-page-container">
      <CodeEditor
        value={code}
        onChange={setCode}
        inputValue={input}
        onInputChange={setInput}
      />
    </div>
  );
}

export default CodeEditorPage; 