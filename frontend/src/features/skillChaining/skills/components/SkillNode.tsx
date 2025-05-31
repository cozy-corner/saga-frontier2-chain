import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { getCategoryColor } from '@features/skillChaining/categories/hooks/categoryColors';
import { SkillNodeData } from '../utils/skillGraphUtils';

/**
 * スキルを表現するカスタムノードコンポーネント
 * 
 * @param data - ノードのデータ（ラベル、カテゴリ、リンク数）
 * @param selected - ノードが選択されているかどうか
 */
export const SkillNode = memo(({ data, selected }: NodeProps<SkillNodeData>) => {
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
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: colors.border }} 
      />
      
      <div className="skill-node-label">
        {data.label}
      </div>
      
      {data.linkCount !== undefined && data.linkCount > 0 && (
        <div className="node-badge" title={`${data.linkCount}個のスキルと連携`}>
          {data.linkCount}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: colors.border }} 
      />
    </div>
  );
});

// displayNameを追加してESLintのreact/display-nameエラーを解決
SkillNode.displayName = 'SkillNode';

// デフォルトエクスポート（ReactFlowのnodeTypesで使用）
export default SkillNode;