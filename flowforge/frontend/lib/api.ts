import type { WorkflowData, ExecutionResult } from './types';
import { apiRequest } from './http';

export async function getWorkflows(): Promise<WorkflowData[]> {
  return apiRequest<WorkflowData[]>('/workflows');
}

export async function getWorkflow(id: string): Promise<WorkflowData> {
  return apiRequest<WorkflowData>(`/workflows/${id}`);
}

export async function getWorkflowBySlug(slug: string): Promise<WorkflowData> {
  return apiRequest<WorkflowData>(`/workflows/slug/${encodeURIComponent(slug)}`);
}

export async function createWorkflow(data: {
  name: string;
  nodes: unknown[];
  edges: unknown[];
  isPublic?: boolean;
  slug: string;
}): Promise<WorkflowData> {
  return apiRequest<WorkflowData>('/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWorkflow(
  id: string,
  data: Partial<{ name: string; nodes: unknown[]; edges: unknown[]; isPublic: boolean }>,
): Promise<WorkflowData> {
  return apiRequest<WorkflowData>(`/workflows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteWorkflow(id: string): Promise<void> {
  await apiRequest<void>(`/workflows/${id}`, { method: 'DELETE' });
}

export async function executeWorkflow(id: string, input: Record<string, unknown>): Promise<ExecutionResult> {
  return apiRequest<ExecutionResult>(`/workflows/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function importFromFigma(figmaUrl: string, accessToken: string): Promise<{
  name: string;
  frameCount: number;
  nodes: unknown[];
  edges: unknown[];
}> {
  return apiRequest<{
    name: string;
    frameCount: number;
    nodes: unknown[];
    edges: unknown[];
  }>('/figma/import', {
    method: 'POST',
    body: JSON.stringify({ figmaUrl, accessToken }),
  });
}

export async function imageToCode(
  imageFile: File,
  framework: string,
): Promise<{ code: string; framework: string; label: string }> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('framework', framework);

  return apiRequest<{ code: string; framework: string; label: string }>('/figma/image-to-code', {
    method: 'POST',
    body: formData,
  });
}

export async function getExecutions(workflowId: string): Promise<ExecutionResult[]> {
  return apiRequest<ExecutionResult[]>(`/workflows/${workflowId}/executions`);
}
