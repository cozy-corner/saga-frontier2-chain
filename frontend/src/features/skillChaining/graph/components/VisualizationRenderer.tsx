import React from 'react';
import { SkillFlowChart } from '../../skills/components/SkillFlowChart';
import { CategoryGraph } from '../../categories/components/CategoryGraph';
import { CategorySkillsGraph } from '../../categories/components/CategorySkillsGraph';
import { DisplayMode } from '../hooks/useVisualizationMode';

interface VisualizationRendererProps {
  displayMode: DisplayMode;
  selectedCategory: string | null;
  graphSkill: string | null;
  selectedCategories: string[];
  allCategories: string[];
  onCategorySelect: (category: string) => void;
  onSkillSelect: (skillName: string, shouldAddToChain: boolean) => void;
}

/**
 * 表示モードに応じて適切なグラフコンポーネントをレンダリングする
 */
export const VisualizationRenderer: React.FC<VisualizationRendererProps> = ({
  displayMode,
  selectedCategory,
  graphSkill,
  selectedCategories,
  allCategories,
  onCategorySelect,
  onSkillSelect
}) => {
  switch (displayMode) {
    case DisplayMode.CATEGORIES:
      return (
        <>
          <CategoryGraph 
            categories={allCategories} 
            onCategorySelect={onCategorySelect} 
          />
          <div className="empty-state">
            <p className="notification">
              カテゴリを選択してください
            </p>
          </div>
        </>
      );
      
    case DisplayMode.SKILLS:
      if (!selectedCategory) return null;
      return (
        <CategorySkillsGraph 
          category={selectedCategory} 
          onSkillSelect={onSkillSelect}
        />
      );
      
    case DisplayMode.FLOWCHART:
      if (!graphSkill) return null;
      return (
        <SkillFlowChart 
          skillName={graphSkill} 
          selectedCategories={selectedCategories}
          onSkillSelect={onSkillSelect}
        />
      );
      
    default:
      return null;
  }
};