'use client';

import Link from 'next/link';

interface Workflow {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
}

interface WorkflowListProps {
  workflows: Workflow[];
}

export function WorkflowList({ workflows }: WorkflowListProps) {
  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No workflows yet</p>
        <Link
          href="/workflows/new"
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Create your first workflow
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer h-full">
            <h2 className="text-xl font-semibold mb-2 line-clamp-2">
              {workflow.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4 line-clamp-1">
              {workflow.slug}
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  workflow.isPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {workflow.isPublic ? 'Public' : 'Private'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(workflow.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}