import React from 'react';
import { Handle, Position } from 'reactflow';
import './Node.css';

const UserQueryNode = ({ data }) => (
  <div className="react-flow__node-userQuery">
    <div className="node-header">User Query</div>
    <Handle type="source" position={Position.Right} id="a" />
  </div>
);

export default UserQueryNode;