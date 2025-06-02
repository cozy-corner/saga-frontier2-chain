import { useState, useCallback, useEffect, useRef } from 'react';
import { useGraphVisualization } from '@features/skillChaining/state/GraphVisualizationContext';
import { useSkillStack } from '@features/skillChaining/state/SkillStackContext';

/**
 * スキル選択とカテゴリフィルターのロジックを管理するカスタムフック
 * @param availableCategories - 利用可能なカテゴリのリスト
 */
export function useSkillSelection(availableCategories: string[] = []) {
  const { state: graphState, setGraphSkill } = useGraphVisualization();
  const { graphSkill } = graphState;
  const { dispatch } = useSkillStack();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const isInitialized = useRef(false);
  
  // 利用可能なカテゴリが取得されたら、初期状態として全て選択する
  useEffect(() => {
    if (availableCategories.length > 0 && !isInitialized.current) {
      setSelectedCategories(availableCategories);
      isInitialized.current = true;
    }
  }, [availableCategories]);
  
  // スキル選択ハンドラー
  const handleSelectSkill = useCallback((skillName: string, shouldAddToChain: boolean = true) => {
    setGraphSkill(skillName);
    
    // 連携チェーンに追加すべき場合のみスタックに追加する
    // これにより、中央ノード（現在表示中のスキル）をクリックしても追加されなくなる
    if (shouldAddToChain) {
      // 同じスキルも複数回追加できるようにする (例: 骨砕き > 骨砕き)
      dispatch({ type: 'ADD_SKILL', payload: skillName });
    }
  }, [setGraphSkill, dispatch]);

  // カテゴリ削除ハンドラー
  const handleRemoveCategory = useCallback((category: string): void => {
    setSelectedCategories(prev => prev.filter(cat => cat !== category));
  }, []);
  
  return {
    graphSkill,
    selectedCategories,
    setSelectedCategories,
    handleSelectSkill,
    handleRemoveCategory
  };
}