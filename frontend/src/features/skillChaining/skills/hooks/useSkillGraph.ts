import { useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { useLinkedSkills } from '@api/hooks/useLinkedSkills';
import { Skill } from '@api/types';
import { calculateCircleLayout } from '@features/skillChaining/graph/utils/graphLayout';
import { getCategoryColor } from '@features/skillChaining/categories/hooks/categoryColors';

interface SkillNodeData {
  label: string;
  category?: string;
  linkCount?: number;
}

/**
 * スキルグラフのノードとエッジを生成する純粋な関数
 */
function createNodesAndEdges(
  sourceSkillName: string,
  skillsToDisplay: Skill[],
  linkedSkills: Skill[]
): { nodes: Node<SkillNodeData>[], edges: Edge[] } {
  const newNodes: Node<SkillNodeData>[] = [];
  const newEdges: Edge[] = [];
  
  // 中心ノード（選択されたスキル）
  const centerNode: Node<SkillNodeData> = {
    id: `source_${sourceSkillName}`,
    type: 'skillNode',
    data: { 
      label: sourceSkillName,
      category: 'default',
      linkCount: linkedSkills ? linkedSkills.length : 0
    },
    position: { x: 250, y: 250 }
  };
  newNodes.push(centerNode);
  
  // 連携先スキルをノードとして追加
  skillsToDisplay.forEach((targetSkill, index) => {
    // 円形に配置する計算
    const position = calculateCircleLayout(skillsToDisplay, index, {
      baseRadius: 100,
      increment: 5
    });
    const { x, y } = position;
    
    // カテゴリーに基づいて色を設定
    const targetSkillCategory = targetSkill.category?.name || '';
    const colors = getCategoryColor(targetSkillCategory);
    const targetSkillName = targetSkill.name;
    const linkCount = targetSkill.linksTo?.length || 0;
    
    newNodes.push({
      id: targetSkillName,
      type: 'skillNode',
      data: { 
        label: targetSkill.name,
        category: targetSkillCategory,
        linkCount: linkCount
      },
      position: { x, y }
    });
    
    // 中心ノードから各スキルへのエッジを追加
    const edgeId = `${sourceSkillName}-to-${targetSkillName}`;
    newEdges.push({
      id: edgeId,
      source: `source_${sourceSkillName}`,
      target: targetSkillName,
      animated: true,
      style: { stroke: colors.border },
      type: 'smoothstep'
    });
  });
  
  return { nodes: newNodes, edges: newEdges };
}

/**
 * スキルグラフのデータ取得とフィルタリングを管理するカスタムフック
 */
export function useSkillGraph(sourceSkillName: string, selectedCategories: string[] = []) {
  // スキルデータの取得
  const { linkedSkills, loading, error } = useLinkedSkills(sourceSkillName, null);
  
  // 選択されたカテゴリに基づいてフィルタリング
  const filteredSkills = useMemo(() => {
    if (!linkedSkills || linkedSkills.length === 0) return [];
    
    // カテゴリが選択されていない場合はすべてのスキルを表示
    if (selectedCategories.length === 0) return linkedSkills;
    
    // 選択されたカテゴリに属するスキルのみをフィルタリング
    const filtered = linkedSkills.filter(skill => {
      const skillCategory = skill.category?.name || '';
      return selectedCategories.includes(skillCategory);
    });
    
    return filtered;
  }, [linkedSkills, selectedCategories]);
  
  // ノードとエッジの生成
  const { nodes, edges } = useMemo(() => {
    // データがない場合や読み込み中は空を返す
    if (loading || error || !sourceSkillName) {
      return { nodes: [], edges: [] };
    }
    
    // 連携スキルが存在しない場合は中心ノードのみ
    if (!filteredSkills || filteredSkills.length === 0) {
      const centerNode: Node<SkillNodeData> = {
        id: `source_${sourceSkillName}`,
        type: 'skillNode',
        data: { 
          label: sourceSkillName,
          category: 'default'
        },
        position: { x: 250, y: 250 }
      };
      return { nodes: [centerNode], edges: [] };
    }
    
    // 通常のグラフ生成
    return createNodesAndEdges(sourceSkillName, filteredSkills, linkedSkills || []);
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