const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getWorkflows() {
  const res = await fetch(`${API}/workflows`);
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

export async function getWorkflow(id: string) {
  const res = await fetch(`${API}/workflows/${id}`);
  if (!res.ok) throw new Error('Failed to fetch workflow');
  return res.json();
}

export async function createWorkflow(data: {
  name: string;
  userId?: string;
  nodes: any[];
  edges: any[];
  isPublic?: boolean;
  slug: string;
}) {
  const res = await fetch(`${API}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to create workflow');
  }
  return res.json();
}

export async function updateWorkflow(id: string, data: Partial<{ name: string; nodes: any[]; edges: any[]; isPublic: boolean }>) {
  const res = await fetch(`${API}/workflows/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update workflow');
  return res.json();
}

export async function deleteWorkflow(id: string) {
  const res = await fetch(`${API}/workflows/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete workflow');
}

export async function executeWorkflow(id: string, input: any) {
  const res = await fetch(`${API}/workflows/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Execution failed');
  }
  return res.json();
}

export async function getExecutions(workflowId: string) {
  const res = await fetch(`${API}/workflows/${workflowId}/executions`);
  if (!res.ok) throw new Error('Failed to fetch executions');
  return res.json();
}
