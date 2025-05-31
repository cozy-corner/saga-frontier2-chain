import { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  ConnectionLineType,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LoadingIndicator } from '@components/common/LoadingIndicator';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { useSkillGraph } from '../hooks/useSkillGraph';
import { useGraphInteractions } from '../hooks/useGraphInteractions';
import SkillNode from './SkillNode';
import './SkillNode.css';
import './SkillFlowChart.css';


interface SkillFlowChartProps {
  skillName: string;
  selectedCategories?: string[];
  onSkillSelect?: (skillName: string, shouldAddToChain: boolean) => void;
}

export function SkillFlowChart({ 
  skillName: sourceSkillName, 
  selectedCategories = [], 
  onSkillSelect 
}: SkillFlowChartProps) {
  // カスタムフックを使用してグラフデータを取得
  const { nodes: graphNodes, edges: graphEdges, loading, error } = useSkillGraph(sourceSkillName, selectedCategories);
  
  // カスタムノードタイプの定義
  const nodeTypes = useMemo<NodeTypes>(() => ({
    skillNode: SkillNode
  }), []);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  
  // グラフインタラクション用のカスタムフック
  const { onNodeMouseEnter, onNodeMouseLeave, onNodeClick } = useGraphInteractions({
    edges,
    sourceSkillName,
    setNodes,
    setEdges,
    setHighlightedNodes,
    onSkillSelect
  });
  
  // グラフデータが更新されたらReactFlowの状態を更新
  useEffect(() => {
    if (loading || error) {
      return;
    }
    
    // 既存のノードとエッジを完全にクリアしてから新しいものを設定
    setNodes([]);
    setEdges([]);
    // ReactFlowの内部状態を確実に更新するために、次のレンダリングサイクルで設定
    setTimeout(() => {
      setNodes(graphNodes);
      setEdges(graphEdges);
    }, 0);
    setHighlightedNodes([sourceSkillName]);
  }, [graphNodes, graphEdges, sourceSkillName, loading, error, setNodes, setEdges]);
  
  if (loading) return <div className="loading-container"><LoadingIndicator /></div>;
  if (error) return <div className="error-container"><ErrorMessage message={error?.message || 'エラーが発生しました'} /></div>;
  if (nodes.length === 0) return <div className="empty-container">スキルの連携データが見つかりませんでした</div>;
  
  return (
    <div className="skill-flow-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeClick={onNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeStrokeColor={(node) => {
            return highlightedNodes.includes(node.id.toString()) ? '#ff0000' : '#555';
          }}
          nodeColor={(node) => {
            return (node.style?.background as string) || '#fff';
          }}
        />
      </ReactFlow>
    </div>
  );
}
