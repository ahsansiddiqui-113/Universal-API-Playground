'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import WorkflowEditor from '../../../components/workflow/workflow-editor';
import { getWorkflow } from '../../../lib/api';

interface WorkflowData {
  id: string;
  name: string;
  userId: string;
  nodes: any[];
  edges: any[];
  isPublic: boolean;
  slug: string;
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getWorkflow(id)
      .then(setWorkflow)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading workflow…</div>;
  if (error) return <div className="p-8 text-red-400 text-sm">{error}</div>;
  if (!workflow) return <div className="p-8 text-gray-400 text-sm">Workflow not found.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-4 bg-gray-900 shrink-0">
        <Link href="/workflows" className="text-gray-400 hover:text-white text-sm transition-colors">← Workflows</Link>
        <span className="text-white font-semibold">{workflow.name}</span>
        <span className="text-xs text-gray-500">/{workflow.slug}</span>
      </div>
      <WorkflowEditor workflow={workflow} />
    </div>
  );
}