import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { SkillNodeData } from '@features/skillChaining/types';
import { getCategoryColor } from '@features/skillChaining/categories/hooks/categoryColors';

/**
 * カテゴリスキルグラフ用のカスタムスキルノードコンポーネント
 * カテゴリの色でスタイリングされ、上下にHandleを持つ
 */
export const CategorySkillNode = ({ data }: NodeProps<SkillNodeData>) => {
  const colors = getCategoryColor(data.category || '');
  
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

CategorySkillNode.displayName = 'CategorySkillNode';