import React, { useMemo } from 'react';
import { calculateCircleLayout } from '@features/skillChaining/graph/utils/graphLayout';
import ReactFlow, { 
  Node, 
  Background, 
  Controls, 
  MiniMap, 
  NodeTypes,
  NodeProps, 
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSkillsByCategory } from '@api/hooks/useSkillsByCategory';
import { getCategoryColor } from '@features/skillChaining/categories/hooks/categoryColors';
import { LoadingIndicator } from '@components/common/LoadingIndicator';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { Skill } from '@api/types';
import '@features/skillChaining/graph/components/GraphStyles.css';

// スキルノードのデータ型
interface SkillNodeData {
  label: string;
  category: string;
}

// カスタムスキルノードコンポーネント
const SkillNode = ({ data }: NodeProps<SkillNodeData>) => {
  const colors = getCategoryColor(data.category);
  
  return (
    <div 
      className="graph-node-base skill-node"
      style={{ 
        background: colors.bg, 
        border: `1px solid ${colors.border}`
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border }} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: colors.border }} />
    </div>
  );
};

// displayNameを追加
SkillNode.displayName = 'SkillNode';

interface CategorySkillsGraphProps {
  category: string;
  onSkillSelect: (skillName: string, shouldAddToChain: boolean) => void;
}

export function CategorySkillsGraph({ 
  category, 
  onSkillSelect 
}: CategorySkillsGraphProps) {
  const { skills, loading, error } = useSkillsByCategory(category);
  
  // カスタムノードタイプの定義
  const nodeTypes = useMemo<NodeTypes>(() => ({
    skillNode: SkillNode
  }), []);
  
  // スキルをノードに変換
  const skillNodes = useMemo<Node[]>(() => {
    if (!skills || skills.length === 0) return [];
    
    return skills.map((skill: Skill, index: number) => {
      // 円形に配置する計算
      const position = calculateCircleLayout(skills, index);
      
      return {
        id: skill.name,
        type: 'skillNode',
        data: { 
          label: skill.name,
          category: category
        },
        position: position
      };
    });
  }, [skills, category]);

  // ノードクリックハンドラ
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    onSkillSelect(node.id as string, true); // カテゴリグラフからのスキル選択は常に連携に追加する
  };

  if (loading) return <div className="loading-container"><LoadingIndicator /></div>;
  if (error) return <div className="error-container"><ErrorMessage message={error?.message || 'エラーが発生しました'} /></div>;
  if (skills.length === 0) return <div className="empty-container">このカテゴリーにスキルがありません。</div>;

  return (
    <div className="category-skills-graph" style={{ height: 600, width: '100%' }}>
      <h3 className="category-skills-title">{category}カテゴリーのスキル</h3>
      <ReactFlow
        nodes={skillNodes}
        edges={[]}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
