from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from routers.auth import get_current_user
from components import llm_engine, knowledge_base

router = APIRouter()

class Node(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]

class Edge(BaseModel):
    id: str
    source: str
    target: str

class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@router.post("/execute")
async def execute_workflow(workflow: Workflow, user: str = Depends(get_current_user)):
    """
    Executes a workflow defined by nodes and edges in a linear fashion.
    """
    nodes_map = {node.id: node for node in workflow.nodes}
    
    user_query_node = next((n for n in workflow.nodes if n.type == 'userQuery'), None)
    if not user_query_node:
        raise HTTPException(status_code=400, detail="Workflow must have a User Query component.")

    query = user_query_node.data.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="No query provided in User Query component.")

    context = None
    final_response = query # Default response if no LLM is present
    
    # Follow the chain from User Query
    current_node_id = user_query_node.id
    
    # Max steps to prevent infinite loops in complex graphs
    for _ in range(len(workflow.nodes)):
        edge = next((edge for edge in workflow.edges if edge.source == current_node_id), None)
        if not edge:
            break # End of the line
        
        current_node_id = edge.target
        current_node = nodes_map[current_node_id]

        if current_node.type == 'knowledgeBase':
            context = knowledge_base.search_knowledge_base(query=query)
        
        elif current_node.type == 'llmEngine':
            prompt = current_node.data.get("prompt", "Answer the following question.")
            final_response = llm_engine.generate_response(query=query, context=context, prompt=prompt)
        
        elif current_node.type == 'output':
            # Output node is the final destination, return the last computed response
            return {"response": final_response}

    # If the workflow ends without an explicit output node
    return {"response": final_response}