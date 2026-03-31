export interface WorkflowNode {
  id: string;
  type: 'input' | 'api' | 'transform' | 'output';
  label?: string;
  fields?: string[];
  [key: string]: unknown;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowData {
  id: string;
  name: string;
  userId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isPublic: boolean;
  slug: string;
  createdAt: string;
}

export interface ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed';
  output: unknown;
  logs: string;
  nodeOutputs: Record<string, unknown>;
}
