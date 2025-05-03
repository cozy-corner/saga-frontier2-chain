import React, { useState, useMemo } from 'react';
import { useGraphVisualization } from './GraphVisualizationContext';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { useCategories } from '../../api/hooks/useCategories';
import { useAllSkills } from '../../api/hooks/useAllSkills';

// Import the new component files
import { SkillVisualizationHeader } from './SkillVisualizationHeader';
import { CategoryFilter } from './CategoryFilter';
import { SelectedCategoryTags } from './SelectedCategoryTags';
import { VisualizationContent } from './VisualizationContent';
import { VisualizationInfo } from './VisualizationInfo';

// Import the CSS
import './SkillChainStyles.css';

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

  // カテゴリ削除ハンドラー
  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat !== category));
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
      <SkillVisualizationHeader 
        title={graphSkill ? `${graphSkill}の連携図` : 'スキル連携グラフ'}
        onSelectSkill={handleSelectSkill}
        allSkills={allSkills}
        loading={isLoading}
      />
      
      <CategoryFilter 
        categories={availableCategories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      
      <SelectedCategoryTags 
        selectedCategories={selectedCategories}
        onRemoveCategory={handleRemoveCategory}
      />
      
      <VisualizationContent 
        graphSkill={graphSkill}
        selectedCategories={selectedCategories}
        onSkillSelect={handleSelectSkill}
      />
      
      <VisualizationInfo 
        categories={availableCategories}
        isLoading={isLoading}
      />
    </div>
  );
}
