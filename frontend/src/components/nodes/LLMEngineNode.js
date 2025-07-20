import React from 'react';
import { Handle, Position } from 'reactflow';
import './Node.css';

const LLMEngineNode = ({ data }) => (
  <div className="react-flow__node-llmEngine">
    <div className="node-header">LLM Engine</div>
    <Handle type="target" position={Position.Left} id="a" />
    <Handle type="source" position={Position.Right} id="b" />
  </div>
);

export default LLMEngineNode;