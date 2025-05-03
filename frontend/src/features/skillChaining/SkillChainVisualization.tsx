import React, { useState, useMemo } from 'react';
import { SkillFlowChart } from './SkillFlowChart';
import { useGraphVisualization } from './GraphVisualizationContext';
import { SmartSearch } from './SmartSearch';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { useCategories } from '../../api/hooks/useCategories';
import { useAllSkills } from '../../api/hooks/useAllSkills';
import { getCategoryColor } from './categoryColors';

export function SkillChainVisualization() {
  const { state: graphState, setGraphSkill } = useGraphVisualization();
  const { graphSkill } = graphState;
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // 全カテゴリを取得
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  
  // 全スキルを取得
  const { allSkills, loading: allSkillsLoading, error: allSkillsError } = useAllSkills();
  
  // 読み込み状態とエラー状態の管理
  const isLoading = categoriesLoading || allSkillsLoading;
  const errorMessage = categoriesError?.message || allSkillsError?.message;
  
  // 利用可能なカテゴリのリストをmemoize
  const availableCategories = useMemo(() => {
    return categories.map(category => category.name);
  }, [categories]);
  
  // スキル選択ハンドラー
  const handleSelectSkill = (skillName: string) => {
    setGraphSkill(skillName);
  };
  
  // エラーがある場合はエラーメッセージを表示
  if (errorMessage) {
    return (
      <div className="error-container">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }
  
  // データ読み込み中の場合はローディング表示
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingIndicator />
      </div>
    );
  }
  
  return (
    <div className="skill-visualization">
      <div className="skill-visualization-header">
        <h2>{graphSkill ? `${graphSkill}の連携図` : 'スキル連携グラフ'}</h2>
        <div className="skill-search">
          <SmartSearch 
            onSelectSkill={handleSelectSkill}
            allSkills={allSkills}
            loading={isLoading}
          />
        </div>
      </div>
      
      {/* カテゴリフィルター */}
      <div className="category-filter">
        <div className="category-filter-header">
          <h4>カテゴリフィルター</h4>
          {selectedCategories.length > 0 && (
            <button 
              className="clear-all-btn" 
              onClick={() => setSelectedCategories([])}
            >
              すべて解除
            </button>
          )}
        </div>
        <div className="category-checkbox-list">
          {availableCategories.map(category => (
            <div key={category} className="category-checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  aria-label={`Filter by ${category} category`}
                  onChange={() => {
                    setSelectedCategories(prev => {
                      if (prev.includes(category)) {
                        return prev.filter(cat => cat !== category);
                      } else {
                        return [...prev, category];
                      }
                    });
                  }}
                />
                <span 
                  className="category-color" 
                  style={{ 
                    background: getCategoryColor(category).bg,
                    border: `1px solid ${getCategoryColor(category).border}`
                  }}
                ></span>
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* 選択中カテゴリ表示 */}
      {selectedCategories.length > 0 && (
        <div className="selected-categories-info">
          <div className="selected-category-tags">
            {selectedCategories.map(cat => {
              const colors = getCategoryColor(cat);
              return (
                <span 
                  key={cat} 
                  className="selected-category-tag" 
                  style={{ 
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    color: '#333'
                  }}
                >
                  {cat}
                  <button 
                    className="remove-category" 
                    onClick={() => {
                      setSelectedCategories(prev => 
                        prev.filter(c => c !== cat)
                      );
                    }}
                    aria-label={`${cat}を削除`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="visualization-container">
        {graphSkill ? (
          <SkillFlowChart 
            skillName={graphSkill} 
            selectedCategories={selectedCategories}
            onSkillSelect={handleSelectSkill}
          />
        ) : (
          <div className="empty-state">
            <p className="notification">
              スキルを検索または選択して連携を表示してください
            </p>
            {selectedCategories.length > 0 && (
              <p className="selected-category">
                現在選択されているカテゴリ: <strong>{selectedCategories.join(', ')}</strong>
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="visualization-info">
        <div className="legend">
          <h4>カテゴリー</h4>
          <ul className="category-legend">
            {availableCategories.map((category) => {
              const colors = getCategoryColor(category);
              return (
                <li key={category}>
                  <span 
                    className="color-box" 
                    style={{ 
                      background: colors.bg,
                      border: `1px solid ${colors.border}`
                    }}
                  ></span> 
                  {category}
                </li>
              );
            })}
            {availableCategories.length === 0 && !isLoading && (
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
    </div>
  );
}

// スタイル用のCSSを追加
const styles = `
.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.skill-visualization {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.skill-visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.skill-search {
  width: 250px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.visualization-container {
  margin-bottom: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.selected-category {
  margin-top: 10px;
  color: #777;
}

.visualization-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
}

.category-filter {
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
  margin-bottom: 15px;
}

.category-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-filter-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #0077cc;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.category-checkbox-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
}

.category-checkbox-item {
  margin-bottom: 6px;
  width: 33%;
  padding-right: 10px;
  box-sizing: border-box;
}

.category-checkbox-item label {
  display: flex;
  align-items: center;
  font-size: 13px;
  cursor: pointer;
}

.category-checkbox-item input {
  margin-right: 6px;
}

.category-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 3px;
}

.selected-categories-info {
  margin-bottom: 15px;
}

.selected-category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-category-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.remove-category {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  margin-left: 5px;
  padding: 0 2px;
}

.remove-category:hover {
  color: #333;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .category-checkbox-item {
    width: 50%; /* スマホでは2列表示 */
  }
}

.legend, .interaction-help {
  flex: 1;
}

.legend h4, .interaction-help h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

ul.category-legend {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul.category-legend li {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.color-box {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 3px;
}

.notification {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 5px;
  text-align: center;
  color: #6c757d;
}

.interaction-help ul {
  padding-left: 20px;
  margin: 0;
}

.interaction-help li {
  margin-bottom: 5px;
}
`;

// スタイルを適用
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
