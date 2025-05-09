// backend/src/test/setup/testData.ts
import { CategoryType } from '../../model/types';

/**
 * Test data for categories
 */
export const testCategories: Omit<CategoryType, 'skills'>[] = [
  { name: '体', order: 1 }, // Body technique category
  { name: '剣', order: 3 }, // Sword category
  { name: '斧', order: 5 }, // Axe category
];

/**
 * Test data for skills
 */
export const testSkills: { name: string, categoryName: string }[] = [
  { name: '裏拳', categoryName: '体' },       // Backfist (Body)
  { name: '胴抜き', categoryName: '体' },     // Body Strike (Body) 
  { name: '熊掌打', categoryName: '体' },     // Bear Palm (Body)
  { name: '切り返し', categoryName: '剣' },   // Counter Cut (Sword)
  { name: '十字切り', categoryName: '剣' },   // Cross Cut (Sword)
  { name: '払い抜け', categoryName: '剣' },   // Parry and Thrust (Sword)
  { name: '大木断', categoryName: '斧' },     // Tree Splitter (Axe)
  { name: '大振り', categoryName: '斧' },     // Heavy Swing (Axe)
];

/**
 * Test data for skill linkage relationships
 */
export const testLinkage: { sourceSkill: string, targetSkill: string }[] = [
  { sourceSkill: '裏拳', targetSkill: '胴抜き' },       // Backfist -> Body Strike
  { sourceSkill: '裏拳', targetSkill: '切り返し' },     // Backfist -> Counter Cut
  { sourceSkill: '胴抜き', targetSkill: '熊掌打' },     // Body Strike -> Bear Palm
  { sourceSkill: '切り返し', targetSkill: '十字切り' }, // Counter Cut -> Cross Cut
  { sourceSkill: '切り返し', targetSkill: '大木断' },   // Counter Cut -> Tree Splitter
  { sourceSkill: '十字切り', targetSkill: '払い抜け' }, // Cross Cut -> Parry and Thrust
  { sourceSkill: '大木断', targetSkill: '大振り' },     // Tree Splitter -> Heavy Swing
];

/**
 * Helper function to find a skill by name in test data
 */
export const findSkillByName = (skillName: string): { name: string, categoryName: string } | undefined => {
  return testSkills.find(skill => skill.name === skillName);
};

/**
 * Helper function to find a category by name in test data
 */
export const findCategoryByName = (categoryName: string): Omit<CategoryType, 'skills'> | undefined => {
  return testCategories.find(category => category.name === categoryName);
};

/**
 * Helper function to find skills by category name in test data
 */
export const findSkillsByCategory = (categoryName: string): { name: string, categoryName: string }[] => {
  return testSkills.filter(skill => skill.categoryName === categoryName);
};

/**
 * Helper function to find skills that link to a given skill
 */
export const findLinksToSkill = (skillName: string): { name: string, categoryName: string }[] => {
  const sourceSkillNames = testLinkage
    .filter(link => link.targetSkill === skillName)
    .map(link => link.sourceSkill);
  
  return testSkills.filter(skill => sourceSkillNames.includes(skill.name));
};

/**
 * Helper function to find skills that a given skill links to
 */
export const findLinksFromSkill = (skillName: string): { name: string, categoryName: string }[] => {
  const targetSkillNames = testLinkage
    .filter(link => link.sourceSkill === skillName)
    .map(link => link.targetSkill);
  
  return testSkills.filter(skill => targetSkillNames.includes(skill.name));
};
