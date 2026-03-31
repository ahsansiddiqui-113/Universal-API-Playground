'use client';

import { useState, useCallback } from 'react';
import { updateWorkflow, executeWorkflow } from '../../lib/api';

type NodeType = 'input' | 'api' | 'transform' | 'output';

interface WorkflowNode {
  id: string;
  type: NodeType;
  label?: string;
  continueOnError?: boolean;
  // input
  fields?: string[];
  // api
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  bodyMode?: string;
  body?: any;
  // transform
  transformMethod?: string;
  params?: Record<string, any>;
  // output
  format?: string;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

interface WorkflowEditorProps {
  workflow: { id: string; name: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] };
}

// ── Node type metadata ──────────────────────────────────────────────────────

const NODE_META: Record<NodeType, { icon: string; label: string; desc: string; accent: string; badge: string; glow: string }> = {
  input:     { icon: '↘', label: 'Input',     desc: 'Receive & validate fields',    accent: 'border-blue-500/50 bg-blue-950/20',    badge: 'bg-blue-600 text-blue-100',     glow: 'shadow-blue-500/10' },
  api:       { icon: '⚡', label: 'API Call',  desc: 'HTTP request to any endpoint', accent: 'border-emerald-500/50 bg-emerald-950/20', badge: 'bg-emerald-600 text-emerald-100', glow: 'shadow-emerald-500/10' },
  transform: { icon: '⚙', label: 'Transform', desc: 'Shape & filter data',           accent: 'border-purple-500/50 bg-purple-950/20', badge: 'bg-purple-600 text-purple-100',  glow: 'shadow-purple-500/10' },
  output:    { icon: '↗', label: 'Output',    desc: 'Format & return result',         accent: 'border-amber-500/50 bg-amber-950/20',  badge: 'bg-amber-600 text-amber-100',   glow: 'shadow-amber-500/10' },
};

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const TRANSFORM_METHODS = [
  'extractField', 'pick', 'omit', 'mapField', 'filterArray',
  'merge', 'wrap', 'flatten', 'stringify', 'parse', 'formatResponse',
];

// ── Editor root ──────────────────────────────────────────────────────────────

export default function WorkflowEditor({ workflow }: WorkflowEditorProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow.nodes || []);
  const [edges, setEdges] = useState<WorkflowEdge[]>(
    (workflow.edges || []).map(e => ({ ...e, id: e.id ?? `e-${e.source}-${e.target}` }))
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [runInput, setRunInput] = useState('{}');
  const [runResult, setRunResult] = useState<any>(null);
  const [runError, setRunError] = useState('');
  const [showRunPanel, setShowRunPanel] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

  const addNode = useCallback((type: NodeType) => {
    const id = `${type}-${Date.now()}`;
    const base: WorkflowNode = { id, type, label: NODE_META[type].label };
    if (type === 'input') base.fields = [];
    if (type === 'api') { base.endpoint = ''; base.method = 'GET'; base.headers = {}; base.bodyMode = 'input'; }
    if (type === 'transform') { base.transformMethod = 'extractField'; base.params = {}; }
    if (type === 'output') base.format = 'json';
    setNodes(prev => [...prev, base]);
    setSelectedNodeId(id);
    setSaved(false);
  }, []);

  const updateNode = useCallback((id: string, patch: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));
    setSaved(false);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    setSaved(false);
  }, [selectedNodeId]);

  const handleConnect = useCallback((targetId: string) => {
    if (!connectingFrom || connectingFrom === targetId) { setConnectingFrom(null); return; }
    const duplicate = edges.some(e => e.source === connectingFrom && e.target === targetId);
    if (!duplicate) {
      setEdges(prev => [...prev, { id: `e-${connectingFrom}-${targetId}`, source: connectingFrom, target: targetId }]);
      setSaved(false);
    }
    setConnectingFrom(null);
  }, [connectingFrom, edges]);

  const deleteEdge = useCallback((id: string) => {
    setEdges(prev => prev.filter(e => e.id !== id));
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateWorkflow(workflow.id, { nodes: nodes as any[], edges: edges as any[] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function handleRun() {
    setRunning(true);
    setRunError('');
    setRunResult(null);
    try {
      const input = JSON.parse(runInput);
      const result = await executeWorkflow(workflow.id, input);
      setRunResult(result);
    } catch (e: any) {
      setRunError(e.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* ── Left: Node Palette ── */}
      <aside className="w-56 shrink-0 bg-gray-900/60 border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Add Node</p>
          <div className="flex flex-col gap-2">
            {(Object.entries(NODE_META) as [NodeType, typeof NODE_META[NodeType]][]).map(([type, meta]) => (
              <button
                key={type}
                onClick={() => addNode(type)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all hover:scale-[1.02] active:scale-100 ${meta.accent} hover:opacity-90`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{meta.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{meta.label}</p>
                    <p className="text-xs text-gray-500 leading-tight">{meta.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 mt-auto flex flex-col gap-2">
          <div className="text-xs text-gray-600 mb-1">
            <span className="font-semibold text-gray-500">{nodes.length}</span> node{nodes.length !== 1 ? 's' : ''}
            {edges.length > 0 && <> · <span className="font-semibold text-gray-500">{edges.length}</span> connection{edges.length !== 1 ? 's' : ''}</>}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full text-sm font-semibold py-2 rounded-lg transition-all ${
              saved
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50'
            }`}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Workflow'}
          </button>
          <button
            onClick={() => { setShowRunPanel(v => !v); setRunResult(null); setRunError(''); }}
            className={`w-full text-sm font-semibold py-2 rounded-lg transition-all border ${
              showRunPanel
                ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white border-transparent'
            }`}
          >
            ▶ {showRunPanel ? 'Hide Runner' : 'Run Workflow'}
          </button>
        </div>
      </aside>

      {/* ── Centre: Canvas ── */}
      <div className="flex-1 overflow-auto bg-gray-950 p-6 relative">
        {/* Dot grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {nodes.length === 0 ? (
          <div className="relative h-full flex flex-col items-center justify-center text-center gap-3 text-gray-600">
            <span className="text-5xl">⚡</span>
            <p className="font-semibold text-gray-500">Start by adding a node</p>
            <p className="text-sm text-gray-600 max-w-xs">
              Pick a node type from the left panel. Typically: Input → API → Transform → Output.
            </p>
          </div>
        ) : (
          <div className="relative max-w-xl space-y-2">

            {/* Connecting hint */}
            {connectingFrom && (
              <div className="mb-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <span>🔗</span>
                <span>Click another node to connect from <strong>{nodes.find(n => n.id === connectingFrom)?.label ?? connectingFrom}</strong></span>
                <button onClick={() => setConnectingFrom(null)} className="ml-auto text-amber-400 hover:text-amber-200">✕ Cancel</button>
              </div>
            )}

            {/* Connections */}
            {edges.length > 0 && (
              <div className="mb-3 p-3 bg-gray-900/50 rounded-lg border border-white/5">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest mb-2">Connections</p>
                <div className="flex flex-wrap gap-1.5">
                  {edges.map(edge => {
                    const src = nodes.find(n => n.id === edge.source);
                    const tgt = nodes.find(n => n.id === edge.target);
                    return (
                      <span key={edge.id} className="flex items-center gap-1.5 text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-white/5">
                        <span className="text-gray-400">{NODE_META[src?.type ?? 'input']?.icon}</span>
                        <span className="font-medium">{src?.label ?? edge.source}</span>
                        <span className="text-gray-600">→</span>
                        <span className="text-gray-400">{NODE_META[tgt?.type ?? 'output']?.icon}</span>
                        <span className="font-medium">{tgt?.label ?? edge.target}</span>
                        <button onClick={() => deleteEdge(edge.id)} className="text-gray-600 hover:text-red-400 ml-0.5 transition-colors">✕</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Node cards */}
            {nodes.map((node, idx) => {
              const meta = NODE_META[node.type];
              const isSelected = selectedNodeId === node.id;
              const isConnectingSource = connectingFrom === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    if (connectingFrom) { handleConnect(node.id); }
                    else setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                  }}
                  className={`relative border rounded-xl p-4 cursor-pointer transition-all shadow-lg ${meta.accent} ${meta.glow}
                    ${isSelected ? 'ring-2 ring-white/20 scale-[1.01]' : 'hover:scale-[1.005]'}
                    ${isConnectingSource ? 'ring-2 ring-amber-400/50' : ''}
                    ${connectingFrom && connectingFrom !== node.id ? 'hover:ring-2 hover:ring-emerald-400/50' : ''}`}
                >
                  {/* Step number */}
                  <span className="absolute -left-3 -top-2.5 w-5 h-5 rounded-full bg-gray-800 border border-white/10 text-xs text-gray-400 flex items-center justify-center font-bold shadow">
                    {idx + 1}
                  </span>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{meta.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${meta.badge}`}>{meta.label}</span>
                          <span className="text-sm font-semibold text-white truncate">{node.label}</span>
                          {node.continueOnError && (
                            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">skip on error</span>
                          )}
                        </div>
                        {/* Node summary line */}
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {node.type === 'api' && `${node.method ?? 'GET'} ${node.endpoint || '(no URL set)'}`}
                          {node.type === 'input' && (node.fields?.length ? `Fields: ${node.fields.join(', ')}` : 'No fields defined')}
                          {node.type === 'transform' && `Method: ${node.transformMethod ?? 'extractField'}`}
                          {node.type === 'output' && `Format: ${node.format ?? 'json'}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        title="Connect from this node to another"
                        onClick={() => setConnectingFrom(connectingFrom === node.id ? null : node.id)}
                        className={`text-xs px-2 py-1 rounded-lg font-mono transition-all border ${
                          isConnectingSource
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-gray-800/60 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                        }`}
                      >
                        →
                      </button>
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="text-xs px-2 py-1 rounded-lg border bg-gray-800/60 border-white/5 text-gray-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Properties or Run Panel ── */}
      <aside className="w-80 shrink-0 bg-gray-900/60 border-l border-white/5 overflow-y-auto">
        {showRunPanel ? (
          <RunPanel
            nodes={nodes}
            running={running}
            runInput={runInput}
            setRunInput={setRunInput}
            runResult={runResult}
            runError={runError}
            onRun={handleRun}
            onClose={() => setShowRunPanel(false)}
          />
        ) : selectedNode ? (
          <NodePropertiesPanel
            node={selectedNode}
            allNodes={nodes}
            onChange={patch => updateNode(selectedNode.id, patch)}
            onDelete={() => deleteNode(selectedNode.id)}
          />
        ) : (
          <div className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full text-gray-600">
            <span className="text-3xl">👈</span>
            <p className="text-sm font-medium text-gray-500">Select a node to edit</p>
            <p className="text-xs text-gray-600">Click any node in the canvas to configure it.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

// ── Node Properties Panel ─────────────────────────────────────────────────────

function NodePropertiesPanel({ node, allNodes, onChange, onDelete }: {
  node: WorkflowNode;
  allNodes: WorkflowNode[];
  onChange: (patch: Partial<WorkflowNode>) => void;
  onDelete: () => void;
}) {
  const meta = NODE_META[node.type];
  const otherNodes = allNodes.filter(n => n.id !== node.id);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className={`px-5 py-4 border-b border-white/5 flex items-center gap-3 ${meta.accent}`}>
        <span className="text-xl">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">{meta.label} Node</p>
          <p className="text-sm font-semibold text-white truncate">{node.label}</p>
        </div>
        <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
          Delete
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1 overflow-y-auto">

        {/* Label */}
        <Section title="Node Label">
          <input
            value={node.label ?? ''}
            onChange={e => onChange({ label: e.target.value })}
            className={inputCls}
            placeholder="e.g. Fetch User"
          />
        </Section>

        {/* Input node */}
        {node.type === 'input' && (
          <Section title="Required Fields" hint="Comma-separated field names that must exist in the run input.">
            <input
              value={(node.fields ?? []).join(', ')}
              onChange={e => onChange({ fields: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })}
              className={inputCls}
              placeholder="e.g. userId, query"
            />
            {(node.fields ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(node.fields ?? []).map(f => (
                  <span key={f} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* API node */}
        {node.type === 'api' && (
          <>
            <Section title="Request">
              <div className="flex gap-2">
                <select
                  value={node.method ?? 'GET'}
                  onChange={e => onChange({ method: e.target.value })}
                  className={`${inputCls} w-24 shrink-0`}
                >
                  {HTTP_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
                <input
                  value={node.endpoint ?? ''}
                  onChange={e => onChange({ endpoint: e.target.value })}
                  className={inputCls}
                  placeholder="https://api.example.com/{{id}}"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                Use <code className="text-indigo-400">{'{{field}}'}</code> for input values or{' '}
                <code className="text-purple-400">{'{{nodeId.field}}'}</code> for a previous node's output.
              </p>
            </Section>

            <Section title="Request Body" hint="How to populate the request body.">
              <select
                value={node.bodyMode ?? 'input'}
                onChange={e => onChange({ bodyMode: e.target.value })}
                className={inputCls}
              >
                <option value="input">Pass current input data</option>
                <option value="custom">Custom JSON body</option>
              </select>
              {node.bodyMode === 'custom' && (
                <textarea
                  value={typeof node.body === 'string' ? node.body : JSON.stringify(node.body ?? {}, null, 2)}
                  onChange={e => { try { onChange({ body: JSON.parse(e.target.value) }); } catch { onChange({ body: e.target.value }); } }}
                  className={`${inputCls} font-mono text-xs mt-2`}
                  rows={4}
                  placeholder='{ "key": "{{value}}" }'
                />
              )}
            </Section>

            <Section title="Headers (JSON)">
              <textarea
                value={JSON.stringify(node.headers ?? {}, null, 2)}
                onChange={e => { try { onChange({ headers: JSON.parse(e.target.value) }); } catch {} }}
                className={`${inputCls} font-mono text-xs`}
                rows={3}
                placeholder='{ "Authorization": "Bearer token" }'
              />
            </Section>
          </>
        )}

        {/* Transform node */}
        {node.type === 'transform' && (
          <>
            <Section title="Transform Method">
              <select
                value={node.transformMethod ?? 'extractField'}
                onChange={e => onChange({ transformMethod: e.target.value })}
                className={inputCls}
              >
                {TRANSFORM_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Section>
            <Section title="Parameters (JSON)" hint="Options depend on the method selected below.">
              <textarea
                value={JSON.stringify(node.params ?? {}, null, 2)}
                onChange={e => { try { onChange({ params: JSON.parse(e.target.value) }); } catch {} }}
                className={`${inputCls} font-mono text-xs`}
                rows={4}
                placeholder='{ "field": "data.result" }'
              />
              <div className="mt-2 text-xs text-gray-600 bg-gray-800/50 rounded-lg p-3 space-y-0.5 font-mono">
                <p><span className="text-purple-400">extractField</span> → field: "a.b"</p>
                <p><span className="text-purple-400">pick / omit</span>  → fields: ["a","b"]</p>
                <p><span className="text-purple-400">mapField</span>     → from, to</p>
                <p><span className="text-purple-400">filterArray</span>  → field, value</p>
                <p><span className="text-purple-400">merge</span>        → extra: {'{}'}</p>
                <p><span className="text-purple-400">wrap</span>         → key: "data"</p>
              </div>
            </Section>
          </>
        )}

        {/* Output node */}
        {node.type === 'output' && (
          <Section title="Output Format">
            <select
              value={node.format ?? 'json'}
              onChange={e => onChange({ format: e.target.value })}
              className={inputCls}
            >
              <option value="json">JSON (object)</option>
              <option value="text">Text (stringify)</option>
            </select>
          </Section>
        )}

        {/* Node reference helper */}
        {otherNodes.length > 0 && (
          <Section title="Node IDs (for templates)" hint="Use these IDs in {{nodeId.field}} placeholders.">
            <div className="space-y-1">
              {otherNodes.map(n => (
                <div key={n.id} className="flex items-center justify-between gap-2 text-xs bg-gray-800/50 rounded-lg px-2.5 py-1.5">
                  <span className="text-gray-400 font-medium">{n.label}</span>
                  <code className="text-indigo-400 font-mono truncate">{n.id}</code>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Error handling */}
        <Section title="Error Handling">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={node.continueOnError ?? false}
                onChange={e => onChange({ continueOnError: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-checked:bg-amber-500 rounded-full transition-colors border border-white/5" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">Continue on error</p>
              <p className="text-xs text-gray-600 mt-0.5">Log the failure and continue with the next node instead of aborting the run.</p>
            </div>
          </label>
        </Section>

      </div>
    </div>
  );
}

// ── Run Panel ────────────────────────────────────────────────────────────────

function RunPanel({ nodes, running, runInput, setRunInput, runResult, runError, onRun, onClose }: {
  nodes: WorkflowNode[];
  running: boolean;
  runInput: string;
  setRunInput: (v: string) => void;
  runResult: any;
  runError: string;
  onRun: () => void;
  onClose: () => void;
}) {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Run Workflow</p>
          <p className="text-xs text-gray-500 mt-0.5">Execute with test data</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all">✕</button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        <Section title="Input JSON" hint="JSON object matching your Input node's declared fields.">
          <textarea
            value={runInput}
            onChange={e => setRunInput(e.target.value)}
            className={`${inputCls} font-mono text-xs`}
            rows={5}
            placeholder="{}"
          />
        </Section>

        <button
          onClick={onRun}
          disabled={running}
          className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {running ? (
            <><span className="animate-spin">⟳</span> Running…</>
          ) : (
            <>▶ Execute</>
          )}
        </button>

        {runError && (
          <div className="flex gap-2.5 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-3">
            <span className="text-red-400 shrink-0 mt-0.5">⚠</span>
            <span className="break-words">{runError}</span>
          </div>
        )}

        {runResult && (
          <div className="space-y-3">
            {/* Status bar */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border ${
              runResult.status === 'completed'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <span>{runResult.status === 'completed' ? '✓' : '✗'}</span>
              <span>{runResult.status === 'completed' ? 'Completed successfully' : 'Completed with errors'}</span>
              {runResult.executionId && (
                <span className="ml-auto font-mono text-gray-500">{runResult.executionId.slice(0, 8)}…</span>
              )}
            </div>

            {/* Final output */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Final Output</p>
              <pre className="text-xs text-emerald-300 bg-gray-800/80 border border-white/5 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap font-mono">
                {JSON.stringify(runResult.output ?? runResult, null, 2)}
              </pre>
            </div>

            {/* Per-node outputs */}
            {runResult.nodeOutputs && Object.keys(runResult.nodeOutputs).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Node-by-Node Results</p>
                <div className="space-y-1.5">
                  {nodes.map(node => {
                    const output = runResult.nodeOutputs?.[node.id];
                    if (output === undefined) return null;
                    const hasError = output?.__error;
                    const isExpanded = expandedNode === node.id;
                    const meta = NODE_META[node.type];
                    return (
                      <div key={node.id} className={`rounded-lg border overflow-hidden ${hasError ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-gray-800/40'}`}>
                        <button
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/5 transition-colors"
                          onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                        >
                          <span className="text-sm">{meta.icon}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${meta.badge}`}>{meta.label}</span>
                          <span className="text-xs text-white font-medium flex-1 truncate">{node.label}</span>
                          <span className={`text-xs ${hasError ? 'text-red-400' : 'text-emerald-400'}`}>
                            {hasError ? '✗' : '✓'}
                          </span>
                          <span className="text-xs text-gray-600">{isExpanded ? '▲' : '▼'}</span>
                        </button>
                        {isExpanded && (
                          <pre className="text-xs font-mono px-3 pb-2.5 overflow-auto max-h-32 whitespace-pre-wrap text-gray-300 border-t border-white/5 pt-2">
                            {JSON.stringify(output, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Logs */}
            {runResult.logs && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Execution Log</p>
                <pre className="text-xs text-gray-500 bg-gray-800/60 border border-white/5 rounded-lg p-3 overflow-auto max-h-36 whitespace-pre-wrap font-mono">
                  {runResult.logs}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-gray-800/80 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-xs font-semibold text-gray-400">{title}</label>
        {hint && <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
