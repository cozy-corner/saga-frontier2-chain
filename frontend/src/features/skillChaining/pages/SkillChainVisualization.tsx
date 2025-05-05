import React, { useState, useMemo } from 'react';
import { useGraphVisualization } from '@features/skillChaining/state/GraphVisualizationContext';
import { useSkillStack } from '@features/skillChaining/state/SkillStackContext';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { LoadingIndicator } from '@components/common/LoadingIndicator';
import { useCategories } from '@api/hooks/useCategories';
import { useAllSkills } from '@api/hooks/useAllSkills';

// Import the component files
import { CategoryFilter } from '../categories/filters/CategoryFilter';
import { SelectedCategoryTags } from '../categories/filters/SelectedCategoryTags';
import { VisualizationContent } from '../graph/components/VisualizationContent';
import { VisualizationInfo } from '../graph/components/VisualizationInfo';
import { StackedSkills } from '../skills/stacking/StackedSkills';

// Import the CSS
import '../SkillChainStyles.css';

export function SkillChainVisualization() {
  const { state: graphState, setGraphSkill } = useGraphVisualization();
  const { graphSkill } = graphState;
  const { dispatch } = useSkillStack();
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
  const handleSelectSkill = (skillName: string, shouldAddToChain: boolean = true) => {
    setGraphSkill(skillName);
    
    // 連携チェーンに追加すべき場合のみスタックに追加する
    // これにより、中央ノード（現在表示中のスキル）をクリックしても追加されなくなる
    if (shouldAddToChain) {
      // 同じスキルも複数回追加できるようにする (例: 骨砕き > 骨砕き)
      dispatch({ type: 'ADD_SKILL', payload: skillName });
    }
  };

  // カテゴリ削除ハンドラー
  const handleRemoveCategory = (category: string): void => {
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
      <h2 className="skill-visualization-title">
        {graphSkill ? `${graphSkill}の連携図` : 'スキル連携グラフ'}
      </h2>
      
      {/* スキルが選択されている場合のみフィルターを表示 */}
      {graphSkill && (
        <>
          <CategoryFilter 
            categories={availableCategories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
          
          <SelectedCategoryTags 
            selectedCategories={selectedCategories}
            onRemoveCategory={handleRemoveCategory}
          />
        </>
      )}
      
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
