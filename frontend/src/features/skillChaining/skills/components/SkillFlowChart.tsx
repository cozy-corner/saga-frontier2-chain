import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { calculateCircleLayout } from '@features/skillChaining/graph/utils/graphLayout';
import ReactFlow, {
  Node,
  Edge,
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
import { useLinkedSkills } from '@api/hooks/useLinkedSkills';
import { LoadingIndicator } from '@components/common/LoadingIndicator';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { getCategoryColor } from '@features/skillChaining/categories/hooks/categoryColors';
import { Skill } from '@api/types';
import './SkillFlowChart.css';

// スキルノードのデータ型を拡張
interface SkillNodeData {
  label: string;
  category?: string;
  linkCount?: number;
}

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

// ノードとエッジを生成する純粋な関数
function createNodesAndEdges(sourceSkillName: string, skillsToDisplay: Skill[], linkedSkills: Skill[]): { nodes: Node[], edges: Edge[] } {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];
  
  // 中心ノード（選択されたスキル）
  const centerNode: Node = {
    id: `source_${sourceSkillName}`,
    type: 'skillNode',
    data: { 
      label: sourceSkillName,
      category: 'default',
      linkCount: linkedSkills ? linkedSkills.length : 0
    },
    position: { x: 250, y: 250 }
  };
  newNodes.push(centerNode);
  
  // 連携先スキルをノードとして追加
  skillsToDisplay.forEach((targetSkill, index) => {
    // 円形に配置する計算
    const position = calculateCircleLayout(skillsToDisplay, index, {
      baseRadius: 100,
      increment: 5
    });
    const { x, y } = position;
    
    // カテゴリーに基づいて色を設定
    const targetSkillCategory = targetSkill.category?.name || '';
    const colors = getCategoryColor(targetSkillCategory);
    const targetSkillName = targetSkill.name;
    const linkCount = targetSkill.linksTo?.length || 0;
    
    newNodes.push({
      id: targetSkillName,
      type: 'skillNode',
      data: { 
        label: targetSkill.name,
        category: targetSkillCategory,
        linkCount: linkCount
      },
      position: { x, y }
    });
    
    // 中心ノードから各スキルへのエッジを追加
    const edgeId = `${sourceSkillName}-to-${targetSkillName}`;
    newEdges.push({
      id: edgeId,
      source: `source_${sourceSkillName}`,
      target: targetSkillName,
      animated: true,
      style: { stroke: colors.border },
      type: 'smoothstep'
    });
  });
  
  return { nodes: newNodes, edges: newEdges };
}

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
  const { linkedSkills, loading, error } = useLinkedSkills(sourceSkillName, null);
  
  // カスタムノードタイプの定義
  const nodeTypes = useMemo<NodeTypes>(() => ({
    skillNode: SkillNode
  }), []);
  
  // 選択されたカテゴリに基づいてフィルタリング
  const filteredSkills = useMemo(() => {
    if (!linkedSkills || linkedSkills.length === 0) return [];
    
    // カテゴリが選択されていない場合はすべてのスキルを表示
    if (selectedCategories.length === 0) return linkedSkills;
    
    // 選択されたカテゴリに属するスキルのみをフィルタリング
    const filtered = linkedSkills.filter(skill => {
      const skillCategory = skill.category?.name || '';
      return selectedCategories.includes(skillCategory);
    });
    
    return filtered;
  }, [linkedSkills, selectedCategories]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  
  // スキルデータからノードとエッジを生成
  useEffect(() => {
    // データチェック: 空の場合や読み込み中は処理しない
    if (loading || error) {
      return;
    }
    
    // 連携スキルが存在しない場合は中心ノードのみ表示
    if (!filteredSkills || filteredSkills.length === 0) {
      // 既存のノードとエッジをクリア
      setNodes([]);
      setEdges([]);
      // 中心ノードのみ設定
      setNodes([{
        id: `source_${sourceSkillName}`,
        type: 'skillNode',
        data: { 
          label: sourceSkillName,
          category: 'default'
        },
        position: { x: 250, y: 250 }
      }]);
      setHighlightedNodes([sourceSkillName]);
      return;
    }
    
    // 純粋な関数を使用してノードとエッジを生成
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(
      sourceSkillName, 
      filteredSkills, 
      linkedSkills || []
    );
    
    // 既存のノードとエッジを完全にクリアしてから新しいものを設定
    setNodes([]);
    setEdges([]);
    // ReactFlowの内部状態を確実に更新するために、次のレンダリングサイクルで設定
    setTimeout(() => {
      setNodes(newNodes);
      setEdges(newEdges);
    }, 0);
    setHighlightedNodes([sourceSkillName]);
  }, [sourceSkillName, filteredSkills, linkedSkills, loading, error, setNodes, setEdges]);
  
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
