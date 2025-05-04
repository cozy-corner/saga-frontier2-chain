import React, { useMemo } from 'react';
import ReactFlow, { 
  Node, 
  Background, 
  Controls, 
  MiniMap, 
  NodeTypes,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getCategoryColor } from '@features/skillChaining/utils/categoryColors';
import './GraphStyles.css';

// カテゴリーノードのデータ型
interface CategoryNodeData {
  label: string;
  color: {
    bg: string;
    border: string;
  }
}

// カスタムカテゴリーノードコンポーネント
const CategoryNode = ({ data }: NodeProps<CategoryNodeData>) => {
  return (
    <div 
      className="category-node"
      style={{ 
        background: data.color.bg, 
        border: `2px solid ${data.color.border}`
      }}
    >
      {data.label}
    </div>
  );
};

// displayNameを追加
CategoryNode.displayName = 'CategoryNode';

interface CategoryGraphProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
}

export function CategoryGraph({ categories, onCategorySelect }: CategoryGraphProps) {
  // カスタムノードタイプの定義
  const nodeTypes = useMemo<NodeTypes>(() => ({
    categoryNode: CategoryNode
  }), []);

  // カテゴリーをノードに変換
  const nodes = useMemo<Node[]>(() => {
    return categories.map((category, index) => {
      // 円形に配置する計算
      const totalCategories = categories.length;
      const angle = (index * 2 * Math.PI) / totalCategories;
      const radius = Math.max(200, 150 + (totalCategories * 5)); // カテゴリー数に応じて半径を調整
      const x = 250 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);
      
      const colors = getCategoryColor(category);
      
      return {
        id: category,
        type: 'categoryNode',
        data: { 
          label: category,
          color: colors
        },
        position: { x, y }
      };
    });
  }, [categories]);

  // ノードクリックハンドラ
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    onCategorySelect(node.id as string);
  };

  return (
    <div className="category-graph" style={{ height: 600, width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
      >
        <Controls />
        <Background />
        <MiniMap 
          nodeColor={(node) => {
            const data = node.data as CategoryNodeData;
            return data.color.bg;
          }}
        />
      </ReactFlow>
    </div>
  );
}
