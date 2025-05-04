import React, { useState, useEffect, useRef } from 'react';
import { SkillFlowChart } from './SkillFlowChart';
import { CategoryGraph } from './CategoryGraph';
import { CategorySkillsGraph } from './CategorySkillsGraph';
import './GraphStyles.css';

interface VisualizationContentProps {
  graphSkill: string | null;
  selectedCategories: string[];
  allCategories: string[];
  onSkillSelect: (skillName: string) => void;
}

export const VisualizationContent: React.FC<VisualizationContentProps> = ({
  graphSkill,
  selectedCategories,
  allCategories,
  onSkillSelect
}) => {
  // 表示モード: 'categories' -> 'skills' -> 'flowchart'
  const [displayMode, setDisplayMode] = useState<'categories' | 'skills' | 'flowchart'>(
    graphSkill ? 'flowchart' : 'categories'
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 現在のdisplayModeへの参照を保持
  const displayModeRef = useRef(displayMode);
  
  // displayModeが変更されたら参照を更新
  useEffect(() => {
    displayModeRef.current = displayMode;
  }, [displayMode]);
  
  // graphSkillが変わった時の処理
  useEffect(() => {
    if (graphSkill) {
      setDisplayMode('flowchart');
    } else if (!graphSkill && displayModeRef.current === 'flowchart') {
      setDisplayMode('categories');
    }
  }, [graphSkill]);

  // カテゴリー選択ハンドラ
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setDisplayMode('skills');
  };

  // スキル選択ハンドラ
  const handleSkillSelect = (skillName: string) => {
    onSkillSelect(skillName);
    setDisplayMode('flowchart');
  };

  return (
    <div className="visualization-container">
      {displayMode === 'categories' ? (
        <>
          <CategoryGraph 
            categories={allCategories} 
            onCategorySelect={handleCategorySelect} 
          />
          <div className="empty-state">
            <p className="notification">
              カテゴリを選択してください
            </p>
          </div>
        </>
      ) : displayMode === 'skills' && selectedCategory ? (
        <CategorySkillsGraph 
          category={selectedCategory} 
          onSkillSelect={handleSkillSelect}
        />
      ) : displayMode === 'flowchart' && graphSkill ? (
        <SkillFlowChart 
          skillName={graphSkill} 
          selectedCategories={selectedCategories}
          onSkillSelect={handleSkillSelect}
        />
      ) : null}
    </div>
  );
};
