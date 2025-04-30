import React, { useState, useEffect, useMemo } from 'react';
import { SkillFlowChart } from './SkillFlowChart';
import { useChain } from './ChainContext';
import { SmartSearch } from './SmartSearch';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { Skill, Category } from '../../api/types';
import { useCategories } from '../../api/hooks/useCategories';
import { useSkillsByCategory } from '../../api/hooks/useSkillsByCategory';

export function SkillChainVisualization() {
  const { state, dispatch } = useChain();
  const { selectedSkill, selectedCategory } = state;
  const [allSkills, setAllSkills] = useState<{ name: string, category?: string }[]>([]);
  
  // 全カテゴリを取得
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  
  // カテゴリが選択されている場合、そのカテゴリのスキルを取得
  const { skills: categorySkills, loading: skillsLoading, error: skillsError } = useSkillsByCategory(selectedCategory);
  
  // カテゴリとスキルの読み込み中かどうかを判定
  const isLoading = categoriesLoading || skillsLoading;
  
  // エラーメッセージを生成
  const errorMessage = categoriesError?.message || skillsError?.message;
  
  // 利用可能なカテゴリのリストをmemoize
  const availableCategories = useMemo(() => {
    return categories.map(category => category.name);
  }, [categories]);
  
  // カテゴリごとのスキルを取得してallSkillsにマージ
  useEffect(() => {
    console.log('カテゴリデータ:', categories);
    
    if (categories.length === 0 || categoriesLoading) return;
    
    // カテゴリごとのスキルをフラットなリストに変換
    const skillsList = categories.flatMap(category => {
      // カテゴリの名前を確認
      if (!category || !category.name) {
        console.warn('無効なカテゴリデータ:', category);
        return [];
      }
      
      // スキルリストの確認
      if (!category.skills || !Array.isArray(category.skills)) {
        console.warn(`${category.name}のスキルがありません`);
        return [];
      }
      
      // スキルデータをフォーマット
      return category.skills.map(skill => ({
        name: skill.name,
        category: category.name
      }));
    });
    
    console.log('全スキルデータ:', skillsList);
    setAllSkills(skillsList);
  }, [categories, categoriesLoading]);
  
  // スキル選択ハンドラー
  const handleSelectSkill = (skillName: string) => {
    dispatch({ type: 'SELECT_SKILL', payload: { name: skillName } });
  };
  
  return (
    <div className="skill-visualization">
      <div className="skill-visualization-header">
        <h2>{selectedSkill ? `${selectedSkill}の連携図` : 'スキル連携グラフ'}</h2>
        <div className="skill-search">
          <SmartSearch 
            onSelectSkill={handleSelectSkill}
            allSkills={allSkills}
            loading={isLoading}
          />
        </div>
      </div>
      
      <div className="visualization-container">
        {selectedSkill ? (
          <SkillFlowChart skillName={selectedSkill} />
        ) : (
          <div className="empty-state">
            <p className="notification">
              スキルを検索または選択して連携を表示してください
            </p>
            {selectedCategory && (
              <p className="selected-category">
                現在選択されているカテゴリ: <strong>{selectedCategory}</strong>
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="visualization-info">
        <div className="legend">
          <h4>カテゴリー</h4>
          <ul className="category-legend">
            {availableCategories.map((category, index) => (
              <li key={category}>
                <span className={`color-box category-${index % 5}`}></span> {category}
              </li>
            ))}
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

.color-box.category-0 {
  background: #d4f1f9;
  border: 1px solid #75c6ef;
}

.color-box.category-1 {
  background: #ffe5e5;
  border: 1px solid #ff9e9e;
}

.color-box.category-2 {
  background: #e6f9d4;
  border: 1px solid #6def75;
}

.color-box.category-3 {
  background: #e5e5ff;
  border: 1px solid #9e9eff;
}

.color-box.category-4 {
  background: #ffffe5;
  border: 1px solid #ffff9e;
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
