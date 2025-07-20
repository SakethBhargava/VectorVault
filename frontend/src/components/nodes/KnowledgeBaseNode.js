import React from 'react';
import { Handle, Position } from 'reactflow';
import './Node.css';

const KnowledgeBaseNode = ({ data }) => (
  <div className="react-flow__node-knowledgeBase">
    <div className="node-header">Knowledge Base</div>
    <Handle type="target" position={Position.Left} id="a" />
    <Handle type="source" position={Position.Right} id="b" />
  </div>
);

export default KnowledgeBaseNode;