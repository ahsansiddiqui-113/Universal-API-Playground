export function TransformNode({ node }: { node: any }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
      <span className="font-semibold">Transform</span>
      {node.method && <span className="text-xs text-gray-600">{node.method}</span>}
      <span className="text-xs text-gray-500 ml-auto">{node.id}</span>
    </div>
  );
}