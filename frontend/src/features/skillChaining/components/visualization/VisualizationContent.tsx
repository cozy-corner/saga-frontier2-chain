import React, { useState, useEffect, useRef } from 'react';
import { SkillFlowChart } from './SkillFlowChart';
import { CategoryGraph } from './CategoryGraph';
import { CategorySkillsGraph } from './CategorySkillsGraph';
import './GraphStyles.css';

enum DisplayMode {
  CATEGORIES = 'categories',
  SKILLS = 'skills',
  FLOWCHART = 'flowchart'
}

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
  // 表示モード: カテゴリー -> スキル -> フローチャート
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    graphSkill ? DisplayMode.FLOWCHART : DisplayMode.CATEGORIES
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
      setDisplayMode(DisplayMode.FLOWCHART);
    } else if (!graphSkill && displayModeRef.current === DisplayMode.FLOWCHART) {
      setDisplayMode(DisplayMode.CATEGORIES);
    }
  }, [graphSkill]);

  // カテゴリー選択ハンドラ
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setDisplayMode(DisplayMode.SKILLS);
  };

  // スキル選択ハンドラ
  const handleSkillSelect = (skillName: string) => {
    onSkillSelect(skillName);
    setDisplayMode(DisplayMode.FLOWCHART);
  };

  return (
    <div className="visualization-container">
      {displayMode === DisplayMode.CATEGORIES ? (
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
      ) : displayMode === DisplayMode.SKILLS && selectedCategory ? (
        <CategorySkillsGraph 
          category={selectedCategory} 
          onSkillSelect={handleSkillSelect}
        />
      ) : displayMode === DisplayMode.FLOWCHART && graphSkill ? (
        <SkillFlowChart 
          skillName={graphSkill} 
          selectedCategories={selectedCategories}
          onSkillSelect={handleSkillSelect}
        />
      ) : null}
    </div>
  );
};
