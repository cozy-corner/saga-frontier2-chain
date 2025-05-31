import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import ReactFlow, {
  ConnectionLineType,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  NodeMouseHandler,
  NodeProps,
  Handle,
  Position,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LoadingIndicator } from '@components/common/LoadingIndicator';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { getCategoryColor } from '@features/skillChaining/categories/hooks/categoryColors';
import { useSkillGraph } from '../hooks/useSkillGraph';
import { SkillNodeData } from '../utils/skillGraphUtils';
import './SkillFlowChart.css';

// カスタムノードコンポーネント
const SkillNode = memo(({ data, selected }: NodeProps<SkillNodeData>) => {
  // カテゴリーに基づいて色を設定
  const colors = getCategoryColor(data.category || 'default');
  
  return (
    <div 
      className={`graph-node-base node-with-badge skill-node ${selected ? 'selected' : ''}`} 
      style={{ 
        background: colors.bg, 
        border: `1px solid ${colors.border}`
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border }} />
      <div>{data.label}</div>
      {data.linkCount !== undefined && data.linkCount > 0 && (
        <div className="node-badge">{data.linkCount}</div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: colors.border }} />
    </div>
  );
});

// displayNameを追加してESLintのreact/display-nameエラーを解決
SkillNode.displayName = 'SkillNode';


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
  
  // ノードホバー時のハイライト処理
  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    try {
      // ホバーしたノードと直接関連するノードをハイライト
      const connectedEdges = edges.filter(e => 
        e.source === node.id || e.target === node.id
      );
      
      const relatedNodeIds = [
        node.id,
        ...connectedEdges.map(e => e.source === node.id ? e.target : e.source)
      ];
      
      setHighlightedNodes(relatedNodeIds);
      
      // 関連ノードの強調表示（カスタムノード用に修正）
      setNodes(nds => 
        nds.map(n => ({
          ...n,
          // ノードクラス名でハイライト状態を制御
          className: relatedNodeIds.includes(n.id) ? 'highlighted-node' : 'faded-node'
        }))
      );
      
      // 関連エッジの強調表示
      setEdges(eds => 
        eds.map(e => ({
          ...e,
          animated: connectedEdges.some(ce => ce.id === e.id),
          style: {
            ...e.style,
            opacity: connectedEdges.some(ce => ce.id === e.id) ? 1 : 0.1,
            zIndex: connectedEdges.some(ce => ce.id === e.id) ? 1 : 0
          }
        }))
      );
    } catch (error) {
      console.error('ノードホバー処理でエラーが発生しました:', error);
    }
  }, [edges, setNodes, setEdges]);
  
  // ノードホバー解除時の処理
  const onNodeMouseLeave = useCallback(() => {
    // 全てのノードとエッジを元の表示に戻す
    setNodes(nds => 
      nds.map(n => ({
        ...n,
        className: '', // クラス名をリセット
      }))
    );
    
    setEdges(eds => 
      eds.map(e => ({
        ...e,
        style: {
          ...e.style,
          opacity: 1,
          zIndex: 0
        }
      }))
    );
    
    setHighlightedNodes([sourceSkillName]);
  }, [sourceSkillName, setNodes, setEdges]);
  
  // ノードクリック時の処理
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    try {
      // ノードデータからスキル名を取得（IDからではなく）
      const clickedSkillName = node.data?.label;
      if (typeof clickedSkillName === 'string') {
        
        // ノードのIDに「source_」が含まれているかで判断
        const shouldAddToChain = !node.id.toString().startsWith('source_');
        
        if (onSkillSelect) {
          onSkillSelect(clickedSkillName, shouldAddToChain);
        }
      }
    } catch (error) {
      console.error('ノードクリック処理でエラーが発生しました:', error);
    }
  }, [onSkillSelect]);
  
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
