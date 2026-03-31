export function ApiNode({ node }: { node: any }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span className="font-semibold">API Call</span>
      {node.endpoint && <span className="text-xs text-gray-600">{node.endpoint}</span>}
      <span className="text-xs text-gray-500 ml-auto">{node.id}</span>
    </div>
  );
}