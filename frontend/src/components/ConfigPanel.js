import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KnowledgeBaseUploader from './KnowledgeBaseUploader'; // Import the new component

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  withCredentials: true,
});

const ConfigPanel = ({ selectedNode, setNodes, nodes, edges }) => {
  const [nodeData, setNodeData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setNodeData(selectedNode.data);
    }
  }, [selectedNode]);

  const handleDataChange = (key, value) => {
    const newData = { ...nodeData, [key]: value };
    setNodeData(newData);
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    }
  };

  const handleExecuteWorkflow = async () => {
    setIsLoading(true);
    setChatResponse('');

    const workflow = { nodes, edges };
    const userQueryNode = nodes.find(n => n.type === 'userQuery');
    if (!userQueryNode || !userQueryNode.data.query) {
      setChatResponse('Error: Please add a User Query node and enter a query in its configuration.');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/workflow/execute', workflow);
      setChatResponse(data.response);
    } catch (error) {
       if (error.response?.status === 401) {
        setChatResponse('Session expired or not logged in. Please refresh and log in.');
       } else {
        setChatResponse(error.response?.data?.detail || 'An error occurred during execution.');
       }
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfig = () => {
    if (!selectedNode) return <div className="no-node-selected">Select a node to configure it.</div>;

    return (
      <div className="config-content">
        <h4>Configure '{nodeData.label}'</h4>
        <label>Node Label:</label>
        <input value={nodeData.label || ''} onChange={(e) => handleDataChange('label', e.target.value)} />

        {selectedNode.type === 'userQuery' && (
          <>
            <label>Query:</label>
            <textarea value={nodeData.query || ''} onChange={(e) => handleDataChange('query', e.target.value)} placeholder="Enter the question for the workflow..." />
          </>
        )}
        {selectedNode.type === 'llmEngine' && (
          <>
            <label>System Prompt:</label>
            <textarea value={nodeData.prompt || ''} onChange={(e) => handleDataChange('prompt', e.target.value)} placeholder="e.g., Use the provided context to answer the question..." />
          </>
        )}
        {/* UPDATED SECTION FOR KNOWLEDGE BASE */}
        {selectedNode.type === 'knowledgeBase' && (
          <KnowledgeBaseUploader />
        )}
      </div>
    );
  };

  return (
    <aside className="config-panel">
      {renderConfig()}
      <div className="execution-controls">
        <button onClick={handleExecuteWorkflow} disabled={isLoading}>
          {isLoading ? 'Executing...' : 'Chat with Stack'}
        </button>
        {chatResponse && (
          <div className="chat-response">
            <h4>Response:</h4>
            <p>{chatResponse}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ConfigPanel;