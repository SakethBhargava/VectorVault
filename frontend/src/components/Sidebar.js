import React from 'react';

const Sidebar = ({ currentUser, onLogout }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
        <div>
            <div className="description">Drag nodes to the canvas to build a workflow.</div>
            <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'userQuery')} draggable>
                User Query
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'knowledgeBase')} draggable>
                KnowledgeBase
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'llmEngine')} draggable>
                LLM Engine
            </div>
            <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
                Output
            </div>
        </div>
        <div style={{marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #eee'}}>
            <p style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>Logged in as: {currentUser}</p>
            <button onClick={onLogout} style={{width: '100%', padding: '8px', background: '#eee', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}}>
                Logout
            </button>
        </div>
    </aside>
  );
};

export default Sidebar;