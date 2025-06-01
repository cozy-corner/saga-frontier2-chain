import React, { useCallback } from 'react';
import { useVisualizationMode } from '../hooks/useVisualizationMode';
import { VisualizationRenderer } from './VisualizationRenderer';
import './GraphStyles.css';

interface VisualizationContentProps {
  graphSkill: string | null;
  selectedCategories: string[];
  allCategories: string[];
  onSkillSelect: (skillName: string, shouldAddToChain: boolean) => void;
}

/**
 * スキル連携の可視化コンテンツを管理するコンポーネント
 * 表示モードの管理と適切なグラフコンポーネントのレンダリングを担当
 */
export const VisualizationContent: React.FC<VisualizationContentProps> = ({
  graphSkill,
  selectedCategories,
  allCategories,
  onSkillSelect
}) => {
  // カスタムフックで表示モードを管理
  const {
    displayMode,
    selectedCategory,
    handleCategorySelect,
    switchToFlowChart
  } = useVisualizationMode(graphSkill);

  // スキル選択ハンドラ
  const handleSkillSelect = useCallback((skillName: string, shouldAddToChain: boolean = true) => {
    onSkillSelect(skillName, shouldAddToChain);
    switchToFlowChart();
  }, [onSkillSelect, switchToFlowChart]);

  return (
    <div className="visualization-container">
      <VisualizationRenderer
        displayMode={displayMode}
        selectedCategory={selectedCategory}
        graphSkill={graphSkill}
        selectedCategories={selectedCategories}
        allCategories={allCategories}
        onCategorySelect={handleCategorySelect}
        onSkillSelect={handleSkillSelect}
      />
    </div>
  );
};