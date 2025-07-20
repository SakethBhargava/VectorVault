import React from 'react';
import { Handle, Position } from 'reactflow';
import './Node.css';

const OutputNode = ({ data }) => (
  <div className="react-flow__node-output">
    <div className="node-header">Output</div>
    <Handle type="target" position={Position.Left} id="a" />
  </div>
);

export default OutputNode;