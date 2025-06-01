import { useMemo } from 'react';
import { useCategories } from '@api/hooks/useCategories';
import { useAllSkills } from '@api/hooks/useAllSkills';

/**
 * スキルチェーン画面で必要なデータを取得するカスタムフック
 * カテゴリとスキルの取得、ローディング状態、エラー状態を管理
 */
export function useSkillChainData() {
  // 全カテゴリを取得
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  
  // 全スキルを取得
  const { allSkills, loading: allSkillsLoading, error: allSkillsError } = useAllSkills();
  
  // 読み込み状態とエラー状態の統合
  const isLoading = categoriesLoading || allSkillsLoading;
  const error = categoriesError || allSkillsError;
  const errorMessage = error?.message;
  
  // 利用可能なカテゴリのリストをmemoize
  const availableCategories = useMemo(() => {
    return categories.map(category => category.name);
  }, [categories]);
  
  return {
    allSkills,
    availableCategories,
    isLoading,
    error,
    errorMessage
  };
}