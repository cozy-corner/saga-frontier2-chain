import React from 'react';
import { getCategoryColor } from '../../utils/categoryColors';

interface VisualizationInfoProps {
  categories: string[];
  isLoading: boolean;
}

export const VisualizationInfo: React.FC<VisualizationInfoProps> = ({
  categories,
  isLoading
}) => {
  return (
    <div className="visualization-info">
      <div className="legend">
        <h4>カテゴリー</h4>
        <ul className="category-legend">
          {categories.map((category) => {
            const colors = getCategoryColor(category);
            return (
              <li key={category}>
                <span 
                  className="color-box" 
                  style={{ 
                    '--category-bg': colors.bg,
                    '--category-border': colors.border 
                  } as React.CSSProperties}
                ></span> 
                {category}
              </li>
            );
          })}
          {categories.length === 0 && !isLoading && (
            <li>カテゴリ情報の取得に失敗しました</li>
          )}
        </ul>
      </div>
      
      <div className="interaction-help">
        <h4>操作方法</h4>
        <ul>
          <li>ノードをクリック: スキルを選択</li>
          <li>ノードにホバー: 関連スキルをハイライト</li>
          <li>ホイール: ズーム</li>
          <li>ドラッグ: 画面移動</li>
        </ul>
      </div>
    </div>
  );
};
