import React from 'react';
import { useSkillChainData } from './hooks/useSkillChainData';
import { useSkillSelection } from './hooks/useSkillSelection';
import { SkillChainLoadingError } from './components/SkillChainLoadingError';
import { CategoryFilterSection } from './components/CategoryFilterSection';
import { VisualizationContent } from '../graph/components/VisualizationContent';
import { VisualizationInfo } from '../graph/components/VisualizationInfo';
import { StackedSkills } from '../skills/stacking/StackedSkills';

// Import the CSS
import '../SkillChainStyles.css';

export function SkillChainVisualization() {
  // カスタムフックでデータ取得とローディング/エラー状態を管理
  const { 
    allSkills, 
    availableCategories, 
    isLoading, 
    errorMessage 
  } = useSkillChainData();
  
  // カスタムフックでスキル選択とカテゴリフィルターのロジックを管理
  const {
    graphSkill,
    selectedCategories,
    setSelectedCategories,
    handleSelectSkill,
    handleRemoveCategory
  } = useSkillSelection();
  
  // ローディングまたはエラー状態の場合は専用コンポーネントを表示
  const loadingOrError = <SkillChainLoadingError isLoading={isLoading} errorMessage={errorMessage} />;
  if (isLoading || errorMessage) {
    return loadingOrError;
  }
  
  return (
    <div className="skill-visualization">
      <h2 className="skill-visualization-title">
        {graphSkill ? `${graphSkill}の連携図` : 'スキル連携グラフ'}
      </h2>
      
      <CategoryFilterSection
        graphSkill={graphSkill}
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        onRemoveCategory={handleRemoveCategory}
      />
      
      {/* スキル積み上げ表示コンポーネント */}
      <StackedSkills
        allSkills={allSkills}
        onSkillClick={handleSelectSkill}
      />
      
      <VisualizationContent 
        graphSkill={graphSkill}
        selectedCategories={selectedCategories}
        allCategories={availableCategories}
        onSkillSelect={handleSelectSkill}
      />
      
      <VisualizationInfo 
        categories={availableCategories}
        isLoading={isLoading}
      />
    </div>
  );
}
