import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from './Sidebar';
import ConfigPanel from './ConfigPanel';
import UserQueryNode from './nodes/UserQueryNode';
import KnowledgeBaseNode from './nodes/KnowledgeBaseNode';
import LLMEngineNode from './nodes/LLMEngineNode';
import OutputNode from './nodes/OutputNode';

// Define nodeTypes outside the component to prevent re-creation on every render
const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llmEngine: LLMEngineNode,
  output: OutputNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

function WorkflowBuilder({ currentUser, onLogout }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <Sidebar currentUser={currentUser} onLogout={onLogout} />
        <div className="reactflow-wrapper" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        <ConfigPanel
          selectedNode={selectedNode}
          setNodes={setNodes}
          nodes={nodes}
          edges={edges}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowBuilder;