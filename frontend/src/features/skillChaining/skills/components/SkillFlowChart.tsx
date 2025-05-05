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
    return linkedSkills.filter(skill => {
      const skillCategory = skill.category?.name || '';
      return selectedCategories.includes(skillCategory);
    });
  }, [linkedSkills, selectedCategories]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  
    // スキルデータからノードとエッジを生成
  useEffect(() => {
    console.log('スキル名:', sourceSkillName);
    console.log('選択カテゴリ:', selectedCategories);
    console.log('連携スキルデータ:', JSON.stringify(linkedSkills, null, 2));
    console.log('フィルタリング後のスキル数:', filteredSkills.length);
    console.log('ローディング状態:', loading);
    console.log('エラー状態:', error?.message);
    
    // データチェック: 空の場合や読み込み中は処理しない
    if (loading) return;
    
    // 使用するスキルデータを選択（フィルタリング済みか全部か）
    const skillsToDisplay = selectedCategories.length > 0 ? filteredSkills : linkedSkills;
    
    if (!skillsToDisplay || skillsToDisplay.length === 0) {
      console.warn('連携スキルが存在しません');
      setNodes([{
        id: sourceSkillName,
        type: 'skillNode',
        data: { 
          label: sourceSkillName,
          category: 'default'
        },
        position: { x: 250, y: 250 }
      }]);
      setEdges([]);
      return;
    }
    
    // 入力データの検証
    const validLinkedSkills = skillsToDisplay.filter(skill => {
      // スキル名の検証
      if (!skill.name || typeof skill.name !== 'string') {
        console.warn('無効なスキル名:', skill);
        return false;
      }
      
      // カテゴリの検証 - カテゴリが存在しなくても有効とする
      if (skill.category && typeof skill.category.name !== 'string') {
        console.warn('無効なカテゴリ:', skill.category);
        // カテゴリが無効でもスキル自体は有効
      }
      
      return true;
    });
    
    console.log('有効なスキル数:', validLinkedSkills.length);
    console.log('フィルタリング状態:', selectedCategories.length > 0 ? 'カテゴリでフィルター中' : 'フィルターなし');
    
    // スキルごとの詳細情報をログに出力
    validLinkedSkills.forEach((targetSkill, index) => {
      console.log(`スキル ${index + 1}:`, {
        名前: targetSkill.name,
        カテゴリ: targetSkill.category?.name || 'カテゴリなし',
        データ構造: JSON.stringify(targetSkill)
      });
    });
    
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // 中心ノード（選択されたスキル）
    // 中心スキルのリンク数はlinkedSkillsの長さ（このスキルからリンクしているスキル数）
    const centerNode: Node = {
      id: `source_${sourceSkillName}`, // ソース/起点としての接頭辞を追加
      type: 'skillNode', // カスタムノードタイプを指定
      data: { 
        label: sourceSkillName,
        category: 'default',
        linkCount: linkedSkills ? linkedSkills.length : 0
      },
      position: { x: 250, y: 250 }
    };
    newNodes.push(centerNode);
    
    // 連携先スキルをノードとして追加
    validLinkedSkills.forEach((targetSkill, index) => {
      // 円形に配置する計算
      const position = calculateCircleLayout(validLinkedSkills, index, {
        baseRadius: 100, // フローチャート用に少し小さめのベース半径
        increment: 5
      });
      const { x, y } = position;
      
      // カテゴリーに基づいて色を設定
      const targetSkillCategory = targetSkill.category?.name || '';
      const colors = getCategoryColor(targetSkillCategory);
      
      console.log(`スキル "${targetSkill.name}" のカテゴリ: ${targetSkillCategory}, 色: ${colors.bg}`);
      
      // スキル名は一意なので、そのままIDとして使用
      const targetSkillName = targetSkill.name;
      
      // リンク数を取得：各スキルが持つlinksToの長さ（リンク先が何個あるか）
      const linkCount = targetSkill.linksTo?.length || 0;
      
      newNodes.push({
        id: targetSkillName,
        type: 'skillNode', // カスタムノードタイプを指定
        data: { 
          label: targetSkill.name,
          category: targetSkillCategory,
          linkCount: linkCount // リンク数を追加
        },
        position: { x, y }
      });
      
      // 中心ノードから各スキルへのエッジを追加（安定したID）
      newEdges.push({
        id: `${sourceSkillName}-to-${targetSkillName}`, // 関係性がわかりやすいID形式
        source: sourceSkillName,
        target: targetSkillName,
        animated: true,
        style: { stroke: colors.border },
        type: 'smoothstep'
      });
    });
    
    setNodes(newNodes);
    setEdges(newEdges);
    setHighlightedNodes([sourceSkillName]); // 初期状態では中心ノードのみハイライト
  }, [sourceSkillName, linkedSkills, filteredSkills, loading, setNodes, setEdges, selectedCategories, error?.message]);
  
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
        console.log(`スキル選択: ${clickedSkillName}`);
        
        // ノードのIDに「source_」が含まれているかで判断
        const shouldAddToChain = !node.id.toString().startsWith('source_');
        
        if (onSkillSelect) {
          onSkillSelect(clickedSkillName, shouldAddToChain);
        }
      } else {
        console.warn('無効なスキル名でクリックされました:', node);
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
