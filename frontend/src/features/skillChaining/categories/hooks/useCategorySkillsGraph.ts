import { useMemo } from 'react';
import { Node } from 'reactflow';
import { useSkillsByCategory } from '@api/hooks/useSkillsByCategory';
import { calculateCircleLayout } from '@features/skillChaining/graph/utils/graphLayout';
import { Skill } from '@api/types';

/**
 * カテゴリスキルグラフのデータを管理するカスタムフック
 * データ取得、ノードの生成、レイアウト計算を担当
 */
export function useCategorySkillsGraph(category: string) {
  // カテゴリ別のスキルを取得
  const { skills, loading, error } = useSkillsByCategory(category);
  
  // スキルをノードに変換
  const skillNodes = useMemo<Node[]>(() => {
    if (!skills || skills.length === 0) return [];
    
    return skills.map((skill: Skill, index: number) => {
      // 円形に配置する計算
      const position = calculateCircleLayout(skills, index);
      
      return {
        id: skill.name,
        type: 'skillNode',
        data: { 
          label: skill.name,
          category: category
        },
        position: position
      };
    });
  }, [skills, category]);
  
  return {
    skills,
    skillNodes,
    loading,
    error,
    hasSkills: skills.length > 0
  };
}