import type { WorkflowData, ExecutionResult } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getWorkflows(): Promise<WorkflowData[]> {
  const res = await fetch(`${API}/workflows`);
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

export async function getWorkflow(id: string): Promise<WorkflowData> {
  const res = await fetch(`${API}/workflows/${id}`);
  if (!res.ok) throw new Error('Failed to fetch workflow');
  return res.json();
}

export async function getWorkflowBySlug(slug: string): Promise<WorkflowData> {
  const res = await fetch(`${API}/workflows/slug/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`No workflow found for slug "${slug}"`);
    throw new Error('Failed to fetch workflow');
  }
  return res.json();
}

export async function createWorkflow(data: {
  name: string;
  userId?: string;
  nodes: unknown[];
  edges: unknown[];
  isPublic?: boolean;
  slug: string;
}): Promise<WorkflowData> {
  const res = await fetch(`${API}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create workflow');
  }
  return res.json();
}

export async function updateWorkflow(
  id: string,
  data: Partial<{ name: string; nodes: unknown[]; edges: unknown[]; isPublic: boolean }>,
): Promise<WorkflowData> {
  const res = await fetch(`${API}/workflows/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update workflow');
  return res.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API}/workflows/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete workflow');
}

export async function executeWorkflow(id: string, input: Record<string, string>): Promise<ExecutionResult> {
  const res = await fetch(`${API}/workflows/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Execution failed');
  }
  return res.json();
}

export async function getExecutions(workflowId: string) {
  const res = await fetch(`${API}/workflows/${workflowId}/executions`);
  if (!res.ok) throw new Error('Failed to fetch executions');
  return res.json();
}
