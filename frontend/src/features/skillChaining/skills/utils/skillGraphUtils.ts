import { Node, Edge } from 'reactflow';
import { Skill } from '@api/types';
import { calculateCircleLayout } from '@features/skillChaining/graph/utils/graphLayout';
import { getCategoryColor } from '@features/skillChaining/categories/hooks/categoryColors';
import { SkillNodeData } from '@features/skillChaining/types';

/**
 * カテゴリに基づいてスキルをフィルタリングする
 * @param skills フィルタリング対象のスキル配列
 * @param selectedCategories 選択されたカテゴリ名の配列
 * @returns フィルタリングされたスキル配列
 */
export function filterSkillsByCategories(
  skills: Skill[],
  selectedCategories: string[]
): Skill[] {
  if (!skills || skills.length === 0) return [];
  
  // カテゴリが選択されていない場合は空配列を返す（スキルを表示しない）
  if (selectedCategories.length === 0) return [];
  
  // 選択されたカテゴリに属するスキルのみをフィルタリング
  return skills.filter(skill => {
    const skillCategory = skill.category?.name || '';
    return selectedCategories.includes(skillCategory);
  });
}

/**
 * 中心ノード（ソーススキル）を生成する
 * @param sourceSkillName ソーススキル名
 * @param linkCount リンク数（オプション）
 * @returns 中心ノード
 */
export function createCenterNode(
  sourceSkillName: string,
  linkCount?: number
): Node<SkillNodeData> {
  return {
    id: `source_${sourceSkillName}`,
    type: 'skillNode',
    data: { 
      label: sourceSkillName,
      category: 'default',
      linkCount: linkCount
    },
    position: { x: 250, y: 250 }
  };
}

/**
 * スキルからノードを生成する
 * @param skill スキルオブジェクト
 * @param position ノードの位置
 * @returns ノードオブジェクト
 */
export function createSkillNode(
  skill: Skill,
  position: { x: number; y: number }
): Node<SkillNodeData> {
  const category = skill.category?.name || '';
  const linkCount = skill.linksTo?.length || 0;
  
  return {
    id: skill.name,
    type: 'skillNode',
    data: { 
      label: skill.name,
      category: category,
      linkCount: linkCount
    },
    position
  };
}

/**
 * ソーススキルからターゲットスキルへのエッジを生成する
 * @param sourceSkillName ソーススキル名
 * @param targetSkill ターゲットスキル
 * @returns エッジオブジェクト
 */
export function createSkillEdge(
  sourceSkillName: string,
  targetSkill: Skill
): Edge {
  const targetSkillCategory = targetSkill.category?.name || '';
  const colors = getCategoryColor(targetSkillCategory);
  
  return {
    id: `${sourceSkillName}-to-${targetSkill.name}`,
    source: `source_${sourceSkillName}`,
    target: targetSkill.name,
    animated: true,
    style: { stroke: colors.border },
    type: 'smoothstep'
  };
}

/**
 * スキルグラフのノードとエッジを生成する
 * @param sourceSkillName ソーススキル名
 * @param skillsToDisplay 表示するスキルの配列
 * @param allLinkedSkills 全ての連携スキル（リンク数の計算用）
 * @returns ノードとエッジの配列
 */
export function createSkillGraphData(
  sourceSkillName: string,
  skillsToDisplay: Skill[],
  allLinkedSkills: Skill[] = []
): { nodes: Node<SkillNodeData>[], edges: Edge[] } {
  const nodes: Node<SkillNodeData>[] = [];
  const edges: Edge[] = [];
  
  // 中心ノード（選択されたスキル）を追加
  const centerNode = createCenterNode(
    sourceSkillName,
    allLinkedSkills.length
  );
  nodes.push(centerNode);
  
  // 連携先スキルをノードとして追加
  skillsToDisplay.forEach((targetSkill, index) => {
    // 円形に配置する計算
    const position = calculateCircleLayout(skillsToDisplay, index, {
      baseRadius: 100,
      increment: 5
    });
    
    // スキルノードを作成
    const skillNode = createSkillNode(targetSkill, position);
    nodes.push(skillNode);
    
    // エッジを作成
    const edge = createSkillEdge(sourceSkillName, targetSkill);
    edges.push(edge);
  });
  
  return { nodes, edges };
}

/**
 * 空のグラフデータ（中心ノードのみ）を生成する
 * @param sourceSkillName ソーススキル名
 * @returns 中心ノードのみを含むグラフデータ
 */
export function createEmptyGraphData(
  sourceSkillName: string
): { nodes: Node<SkillNodeData>[], edges: Edge[] } {
  const centerNode = createCenterNode(sourceSkillName);
  return { nodes: [centerNode], edges: [] };
}