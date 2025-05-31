import { useMemo } from 'react';
import { useLinkedSkills } from '@api/hooks/useLinkedSkills';
import { 
  filterSkillsByCategories, 
  createSkillGraphData, 
  createEmptyGraphData 
} from '../utils/skillGraphUtils';

/**
 * スキルグラフのデータ取得とフィルタリングを管理するカスタムフック
 */
export function useSkillGraph(sourceSkillName: string, selectedCategories: string[] = []) {
  // スキルデータの取得
  const { linkedSkills, loading, error } = useLinkedSkills(sourceSkillName, null);
  
  // 選択されたカテゴリに基づいてフィルタリング
  const filteredSkills = useMemo(() => {
    return filterSkillsByCategories(linkedSkills || [], selectedCategories);
  }, [linkedSkills, selectedCategories]);
  
  // ノードとエッジの生成
  const { nodes, edges } = useMemo(() => {
    // データがない場合や読み込み中は空を返す
    if (loading || error || !sourceSkillName) {
      return { nodes: [], edges: [] };
    }
    
    // 連携スキルが存在しない場合は中心ノードのみ
    if (!filteredSkills || filteredSkills.length === 0) {
      return createEmptyGraphData(sourceSkillName);
    }
    
    // 通常のグラフ生成
    return createSkillGraphData(sourceSkillName, filteredSkills, linkedSkills || []);
  }, [sourceSkillName, filteredSkills, linkedSkills, loading, error]);
  
  return {
    nodes,
    edges,
    loading,
    error,
    filteredSkills,
    linkedSkills
  };
}