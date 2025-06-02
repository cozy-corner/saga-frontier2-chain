import { describe, it, expect } from 'vitest';
import {
  filterSkillsByCategories,
  createCenterNode,
  createSkillNode,
  createSkillEdge,
  createSkillGraphData,
  createEmptyGraphData,
} from '../skillGraphUtils';
import { Skill } from '@api/types';

describe('skillGraphUtils', () => {
  // バックエンドのテストデータを基に作成
  const mockSkills: Skill[] = [
    {
      name: '裏拳',
      category: { name: '体', order: 1 },
      linksTo: [
        { name: '胴抜き' },
        { name: '切り返し' }
      ],
    },
    {
      name: '胴抜き',
      category: { name: '体', order: 1 },
      linksTo: [{ name: '熊掌打' }],
    },
    {
      name: '切り返し',
      category: { name: '剣', order: 3 },
      linksTo: [
        { name: '十字切り' },
        { name: '大木断' }
      ],
    },
    {
      name: '十字切り',
      category: { name: '剣', order: 3 },
      linksTo: [{ name: '払い抜け' }],
    },
    {
      name: '大木断',
      category: { name: '斧', order: 5 },
      linksTo: [{ name: '大振り' }],
    },
  ];

  describe('filterSkillsByCategories', () => {
    it('should return empty array when no categories are selected', () => {
      const result = filterSkillsByCategories(mockSkills, []);
      expect(result).toEqual([]);
    });

    it('should filter skills by single category', () => {
      const result = filterSkillsByCategories(mockSkills, ['体']);
      expect(result).toHaveLength(2);
      expect(result.every(skill => skill.category?.name === '体')).toBe(true);
    });

    it('should filter skills by multiple categories', () => {
      const result = filterSkillsByCategories(mockSkills, ['体', '剣']);
      expect(result).toHaveLength(4);
      expect(result.some(skill => skill.category?.name === '体')).toBe(true);
      expect(result.some(skill => skill.category?.name === '剣')).toBe(true);
    });

    it('should return empty array when no skills match', () => {
      const result = filterSkillsByCategories(mockSkills, ['槍']);
      expect(result).toHaveLength(0);
    });

    it('should handle empty skills array', () => {
      const result = filterSkillsByCategories([], ['体']);
      expect(result).toHaveLength(0);
    });

    it('should handle skills without category', () => {
      const skillsWithoutCategory: Skill[] = [
        { name: '無所属技' },
        { name: '払い抜け', category: { name: '剣' } },
      ];
      const result = filterSkillsByCategories(skillsWithoutCategory, ['剣']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('払い抜け');
    });
  });

  describe('createCenterNode', () => {
    it('should create center node with default values', () => {
      const node = createCenterNode('裏拳');
      
      expect(node.id).toBe('source_裏拳');
      expect(node.type).toBe('skillNode');
      expect(node.data.label).toBe('裏拳');
      expect(node.data.category).toBe('default');
      expect(node.data.linkCount).toBeUndefined();
      expect(node.position).toEqual({ x: 250, y: 250 });
    });

    it('should create center node with link count', () => {
      const node = createCenterNode('切り返し', 2);
      
      expect(node.data.linkCount).toBe(2);
    });
  });

  describe('createSkillNode', () => {
    it('should create skill node from skill data', () => {
      const skill = mockSkills[2]; // 切り返し
      const position = { x: 100, y: 200 };
      const node = createSkillNode(skill, position);
      
      expect(node.id).toBe('切り返し');
      expect(node.type).toBe('skillNode');
      expect(node.data.label).toBe('切り返し');
      expect(node.data.category).toBe('剣');
      expect(node.data.linkCount).toBe(2);
      expect(node.position).toEqual(position);
    });

    it('should handle skill without category', () => {
      const skill: Skill = { name: 'テストスキル' };
      const node = createSkillNode(skill, { x: 0, y: 0 });
      
      expect(node.data.category).toBe('');
    });

    it('should handle skill without linksTo', () => {
      const skill: Skill = { name: 'テストスキル' };
      const node = createSkillNode(skill, { x: 0, y: 0 });
      
      expect(node.data.linkCount).toBe(0);
    });
  });

  describe('createSkillEdge', () => {
    it('should create edge between source and target skill', () => {
      const targetSkill = mockSkills[0]; // 裏拳
      const edge = createSkillEdge('中心スキル', targetSkill);
      
      expect(edge.id).toBe('中心スキル-to-裏拳');
      expect(edge.source).toBe('source_中心スキル');
      expect(edge.target).toBe('裏拳');
      expect(edge.animated).toBe(true);
      expect(edge.type).toBe('smoothstep');
      expect(edge.style?.stroke).toBeDefined();
    });

    it('should use different colors for different categories', () => {
      const bodySkill = mockSkills[0]; // 体
      const swordSkill = mockSkills[2]; // 剣
      
      const bodyEdge = createSkillEdge('中心', bodySkill);
      const swordEdge = createSkillEdge('中心', swordSkill);
      
      expect(bodyEdge.style?.stroke).not.toBe(swordEdge.style?.stroke);
    });
  });

  describe('createSkillGraphData', () => {
    it('should create graph with center node and skill nodes', () => {
      const { nodes, edges } = createSkillGraphData('中心スキル', mockSkills.slice(0, 2), mockSkills);
      
      expect(nodes).toHaveLength(3); // 1 center + 2 skills
      expect(edges).toHaveLength(2); // 2 edges from center to skills
      
      // 中心ノードの確認
      const centerNode = nodes.find(n => n.id === 'source_中心スキル');
      expect(centerNode).toBeDefined();
      expect(centerNode?.data.linkCount).toBe(mockSkills.length);
      
      // スキルノードの確認
      const skillNode = nodes.find(n => n.id === '裏拳');
      expect(skillNode).toBeDefined();
      expect(skillNode?.data.label).toBe('裏拳');
    });

    it('should position nodes in a circle', () => {
      const { nodes } = createSkillGraphData('中心', mockSkills, []);
      
      // 中心ノード以外のノードの位置を確認
      const skillNodes = nodes.filter(n => !n.id.startsWith('source_'));
      
      // 各ノードが異なる位置に配置されていることを確認
      const positions = skillNodes.map(n => `${n.position.x},${n.position.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(skillNodes.length);
    });

    it('should handle empty skills array', () => {
      const { nodes, edges } = createSkillGraphData('中心', [], []);
      
      expect(nodes).toHaveLength(1); // Only center node
      expect(edges).toHaveLength(0);
    });
  });

  describe('createEmptyGraphData', () => {
    it('should create graph with only center node', () => {
      const { nodes, edges } = createEmptyGraphData('十字切り');
      
      expect(nodes).toHaveLength(1);
      expect(edges).toHaveLength(0);
      
      const centerNode = nodes[0];
      expect(centerNode.id).toBe('source_十字切り');
      expect(centerNode.data.label).toBe('十字切り');
      expect(centerNode.data.linkCount).toBeUndefined();
    });
  });
});