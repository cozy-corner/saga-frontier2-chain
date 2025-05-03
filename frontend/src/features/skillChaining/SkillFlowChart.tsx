import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLinkedSkills } from '../../api/hooks/useLinkedSkills';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { getCategoryColor } from './categoryColors';
import './SkillFlowChart.css';

interface SkillFlowChartProps {
  skillName: string;
  selectedCategories?: string[];
  onSkillSelect?: (skillName: string) => void;
}

export function SkillFlowChart({ 
  skillName, 
  selectedCategories = [], 
  onSkillSelect 
}: SkillFlowChartProps) {
  const { linkedSkills, loading, error } = useLinkedSkills(skillName, null);
  
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
    console.log('スキル名:', skillName);
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
      const centerColors = getCategoryColor('default');
      setNodes([{
        id: skillName,
        data: { label: skillName },
        position: { x: 250, y: 250 },
        style: { 
          background: centerColors.bg, 
          border: `1px solid ${centerColors.border}`,
          padding: '10px',
          borderRadius: '5px',
          width: 150,
          textAlign: 'center'
        }
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
    validLinkedSkills.forEach((skill, index) => {
      console.log(`スキル ${index + 1}:`, {
        名前: skill.name,
        カテゴリ: skill.category?.name || 'カテゴリなし',
        データ構造: JSON.stringify(skill)
      });
    });
    
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // 中心ノード（選択されたスキル）
    const centerColors = getCategoryColor('default');
    const centerNode: Node = {
      id: skillName,
      data: { label: skillName },
      position: { x: 250, y: 250 },
      style: { 
        background: centerColors.bg, 
        border: `1px solid ${centerColors.border}`,
        padding: '10px',
        borderRadius: '5px',
        width: 150,
        textAlign: 'center'
      }
    };
    newNodes.push(centerNode);
    
    // 連携スキルをノードとして追加
    validLinkedSkills.forEach((skill, index) => {
      // 円形に配置する計算
      const totalSkills = validLinkedSkills.length;
      const angle = (index * 2 * Math.PI) / totalSkills;
      const radius = Math.max(200, 100 + (totalSkills * 5)); // スキル数に応じて半径を調整
      const x = 250 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);
      
      // カテゴリーに基づいて色を設定
      const skillCategoryName = skill.category?.name || '';
      const colors = getCategoryColor(skillCategoryName);
      
      console.log(`スキル "${skill.name}" のカテゴリ: ${skillCategoryName}, 色: ${colors.bg}`);
      
      // スキル名が一意であることを確認
      const uniqueId = `${skill.name}-${index}`;
      
      newNodes.push({
        id: uniqueId,
        data: { 
          label: skill.name,
          category: skillCategoryName
        },
        position: { x, y },
        style: { 
          background: colors.bg, 
          border: `1px solid ${colors.border}`,
          padding: '10px',
          borderRadius: '5px',
          width: 150,
          textAlign: 'center'
        }
      });
      
      // 中心ノードから各スキルへのエッジを追加
      newEdges.push({
        id: `${skillName}-${uniqueId}`,
        source: skillName,
        target: uniqueId,
        animated: true,
        style: { stroke: colors.border },
        type: 'smoothstep'
      });
    });
    
    setNodes(newNodes);
    setEdges(newEdges);
    setHighlightedNodes([skillName]); // 初期状態では中心ノードのみハイライト
  }, [skillName, linkedSkills, filteredSkills, loading, setNodes, setEdges, selectedCategories, error?.message]);
  
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
      
      // 関連ノードの強調表示
      setNodes(nds => 
        nds.map(n => ({
          ...n,
          style: {
            ...n.style,
            opacity: relatedNodeIds.includes(n.id) ? 1 : 0.3,
            zIndex: relatedNodeIds.includes(n.id) ? 1 : 0
          }
        }))
      );
      
      // 関連エッジの強調表示
      setEdges(eds => 
        eds.map(e => ({
          ...e,
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
        style: {
          ...n.style,
          opacity: 1,
          zIndex: 0
        }
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
    
    setHighlightedNodes([skillName]);
  }, [skillName, setNodes, setEdges]);
  
  // ノードクリック時の処理
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    try {
      // ノードデータからスキル名を取得（IDからではなく）
      const clickedSkillName = node.data?.label;
      if (typeof clickedSkillName === 'string') {
        console.log(`スキル選択: ${clickedSkillName}`);
        if (onSkillSelect) {
          onSkillSelect(clickedSkillName);
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
