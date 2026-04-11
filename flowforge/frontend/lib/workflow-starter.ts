import type { WorkflowEdge, WorkflowNode } from './types';

type ExampleInputNode = {
  type: string;
  fields?: string[];
};

type StarterWorkflowNode = WorkflowNode & {
  continueOnError?: boolean;
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  bodyMode?: 'input' | 'custom';
  body?: unknown;
  transformMethod?: string;
  params?: Record<string, unknown>;
  format?: 'json' | 'text';
};

const STARTER_NODES: StarterWorkflowNode[] = [
  {
    id: 'input-user',
    type: 'input',
    label: 'Input User ID',
    fields: ['userId'],
  },
  {
    id: 'api-fetch-user',
    type: 'api',
    label: 'Fetch User API',
    method: 'GET',
    endpoint: 'https://jsonplaceholder.typicode.com/users/{{userId}}',
    headers: {},
    bodyMode: 'input',
  },
  {
    id: 'transform-pick-user',
    type: 'transform',
    label: 'Pick User Fields',
    transformMethod: 'pick',
    params: {
      fields: ['id', 'name', 'email', 'website'],
    },
  },
  {
    id: 'output-result',
    type: 'output',
    label: 'Output JSON',
    format: 'json',
  },
];

const STARTER_EDGES: WorkflowEdge[] = [
  { id: 'e-input-user-api-fetch-user', source: 'input-user', target: 'api-fetch-user' },
  { id: 'e-api-fetch-user-transform-pick-user', source: 'api-fetch-user', target: 'transform-pick-user' },
  { id: 'e-transform-pick-user-output-result', source: 'transform-pick-user', target: 'output-result' },
];

export function createApiTestStarterWorkflow(): {
  nodes: StarterWorkflowNode[];
  edges: WorkflowEdge[];
} {
  return {
    nodes: STARTER_NODES.map((node) => ({
      ...node,
      fields: node.fields ? [...node.fields] : undefined,
      headers: node.headers ? { ...node.headers } : undefined,
      body:
        node.body && typeof node.body === 'object'
          ? JSON.parse(JSON.stringify(node.body))
          : node.body,
      params: node.params ? JSON.parse(JSON.stringify(node.params)) : undefined,
    })),
    edges: STARTER_EDGES.map((edge) => ({ ...edge })),
  };
}

export function getExampleRunInput(nodes: ExampleInputNode[]): string {
  const inputNode = nodes.find((node) => node.type === 'input');
  const fields = Array.isArray(inputNode?.fields) ? inputNode.fields : [];
  if (fields.length === 0) {
    return '{}';
  }

  return JSON.stringify(
    Object.fromEntries(fields.map((field) => [field, getExampleValue(field)])),
    null,
    2,
  );
}

function getExampleValue(field: string): number | string {
  const normalized = field.toLowerCase();

  if (normalized === 'userid' || normalized.endsWith('id')) return 1;
  if (normalized.includes('email')) return 'user@example.com';
  if (normalized.includes('url') || normalized.includes('endpoint')) return 'https://api.example.com/resource';
  if (normalized.includes('name')) return 'Jane Doe';
  if (normalized.includes('query') || normalized.includes('search')) return 'octocat';
  if (normalized.includes('token')) return 'demo-token';

  return `example-${field}`;
}
