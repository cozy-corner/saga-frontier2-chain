import React, { useMemo, useCallback } from 'react';
import ReactFlow, { 
  Node, 
  Background, 
  Controls, 
  MiniMap, 
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { OnSkillSelectCallback } from '@features/skillChaining/types';
import { LoadingIndicator } from '@components/common/LoadingIndicator';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { useCategorySkillsGraph } from '../hooks/useCategorySkillsGraph';
import { CategorySkillNode } from './CategorySkillNode';
import '@features/skillChaining/graph/components/GraphStyles.css';

interface CategorySkillsGraphProps {
  category: string;
  onSkillSelect: OnSkillSelectCallback;
}

export function CategorySkillsGraph({ 
  category, 
  onSkillSelect 
}: CategorySkillsGraphProps) {
  // カスタムフックでデータ取得とノード生成を管理
  const { skillNodes, loading, error, hasSkills } = useCategorySkillsGraph(category);
  
  // カスタムノードタイプの定義
  const nodeTypes = useMemo<NodeTypes>(() => ({
    skillNode: CategorySkillNode
  }), []);

  // ノードクリックハンドラー
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onSkillSelect(node.id as string, true); // カテゴリグラフからのスキル選択は常に連携に追加する
  }, [onSkillSelect]);

  // ローディング状態
  if (loading) {
    return (
      <div className="loading-container">
        <LoadingIndicator />
      </div>
    );
  }
  
  // エラー状態
  if (error) {
    return (
      <div className="error-container">
        <ErrorMessage message={error?.message || 'エラーが発生しました'} />
      </div>
    );
  }
  
  // スキルがない場合
  if (!hasSkills) {
    return (
      <div className="empty-container">
        このカテゴリーにスキルがありません。
      </div>
    );
  }

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
