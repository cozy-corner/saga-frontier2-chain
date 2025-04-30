// backend/src/test/repository.test.ts
import * as repository from '../infrastructure/neo4jRepository';
import { testCategories, testSkills, testLinkage } from './setup/testData';
import { setupRepositoryMocks, resetRepositoryMocks } from './mock/repositoryMock';

describe('Neo4j Repository', () => {
  beforeEach(() => {
    // Directly mock repository functions instead of mocking Neo4j driver
    setupRepositoryMocks();
  });
  
  afterEach(() => {
    // Reset all mocks between tests
    resetRepositoryMocks();
    jest.clearAllMocks();
  });
  
  describe('Category operations', () => {
    test('findAllCategories returns all categories', async () => {
      const categories = await repository.findAllCategories();
      
      expect(categories).toHaveLength(testCategories.length);
      expect(categories.map(c => c.name)).toEqual(expect.arrayContaining(testCategories.map(c => c.name)));
    });
    
    test('findCategoryByName returns the correct category', async () => {
      const categoryName = '剣'; // Sword category
      const category = await repository.findCategoryByName(categoryName);
      
      expect(category).not.toBeNull();
      expect(category?.name).toBe(categoryName);
    });
    
    test('findCategoryByName returns null for non-existent category', async () => {
      const categoryName = '存在しないカテゴリ'; // Non-existent category
      const category = await repository.findCategoryByName(categoryName);
      
      expect(category).toBeNull();
    });
  });
  
  describe('Skill operations', () => {
    test('findSkills returns all skills when no category is specified', async () => {
      const skills = await repository.findSkills();
      
      expect(skills).toHaveLength(testSkills.length);
      expect(skills.map(s => s.name)).toEqual(expect.arrayContaining(testSkills.map(s => s.name)));
    });
    
    test('findSkills returns skills filtered by category', async () => {
      const categoryName = '体';
      const expectedSkills = testSkills.filter(s => s.categoryName === categoryName);
      
      const skills = await repository.findSkills(categoryName);
      
      expect(skills).toHaveLength(expectedSkills.length);
      expect(skills.map(s => s.name)).toEqual(expect.arrayContaining(expectedSkills.map(s => s.name)));
    });
    
    test('findSkillByName returns the correct skill', async () => {
      const skillName = '裏拳';
      const skill = await repository.findSkillByName(skillName);
      
      expect(skill).not.toBeNull();
      expect(skill?.name).toBe(skillName);
    });
    
    test('findSkillByName returns null for non-existent skill', async () => {
      const skillName = '存在しないスキル'; // Non-existent skill
      const skill = await repository.findSkillByName(skillName);
      
      expect(skill).toBeNull();
    });
    
    test('findSkillsForCategory returns skills for a category', async () => {
      const categoryName = '剣';
      const expectedSkills = testSkills.filter(s => s.categoryName === categoryName);
      
      const skills = await repository.findSkillsForCategory(categoryName);
      
      expect(skills).toHaveLength(expectedSkills.length);
      expect(skills.map(s => s.name)).toEqual(expect.arrayContaining(expectedSkills.map(s => s.name)));
    });
  });
  
  describe('Relationship operations', () => {
    test('findCategoryForSkill returns the correct category', async () => {
      const skillName = '裏拳';
      const expectedCategory = testCategories.find(c => 
        c.name === testSkills.find(s => s.name === skillName)?.categoryName
      );
      
      const category = await repository.findCategoryForSkill(skillName);
      
      expect(category).not.toBeNull();
      expect(category?.name).toBe(expectedCategory?.name);
    });
    
    test('findSkillsLinkedFrom returns skills that a skill links to', async () => {
      const skillName = '裏拳';
      const expectedLinks = testLinkage
        .filter(link => link.sourceSkill === skillName)
        .map(link => link.targetSkill);
      
      const linkedSkills = await repository.findSkillsLinkedFrom(skillName);
      
      expect(linkedSkills).toHaveLength(expectedLinks.length);
      expect(linkedSkills.map(s => s.name)).toEqual(expect.arrayContaining(expectedLinks));
    });
    
    test('findSkillsLinkedTo returns skills that link to a skill', async () => {
      const skillName = '十字切り';
      const expectedLinks = testLinkage
        .filter(link => link.targetSkill === skillName)
        .map(link => link.sourceSkill);
      
      const linkedSkills = await repository.findSkillsLinkedTo(skillName);
      
      expect(linkedSkills).toHaveLength(expectedLinks.length);
      expect(linkedSkills.map(s => s.name)).toEqual(expect.arrayContaining(expectedLinks));
    });
    
    test('findLinkedFromCategories returns distinct categories of skills linked from', async () => {
      const skillName = '裏拳';
      // Find skills linked from '裏拳'
      const linkedSkillNames = testLinkage
        .filter(link => link.sourceSkill === skillName)
        .map(link => link.targetSkill);
        
      // Find categories of those skills
      const linkedSkillCategories = testSkills
        .filter(skill => linkedSkillNames.includes(skill.name))
        .map(skill => skill.categoryName);
        
      // Get distinct categories
      const expectedCategories = [...new Set(linkedSkillCategories)];
      
      const categories = await repository.findLinkedFromCategories(skillName);
      
      expect(categories).toHaveLength(expectedCategories.length);
      expect(categories.map(c => c.name)).toEqual(expect.arrayContaining(expectedCategories));
    });
    
    test('findLinkedToCategories returns distinct categories of skills linked to', async () => {
      const skillName = '十字切り';
      // Find skills linked to '十字切り'
      const linkedSkillNames = testLinkage
        .filter(link => link.targetSkill === skillName)
        .map(link => link.sourceSkill);
        
      // Find categories of those skills
      const linkedSkillCategories = testSkills
        .filter(skill => linkedSkillNames.includes(skill.name))
        .map(skill => skill.categoryName);
        
      // Get distinct categories
      const expectedCategories = [...new Set(linkedSkillCategories)];
      
      const categories = await repository.findLinkedToCategories(skillName);
      
      expect(categories).toHaveLength(expectedCategories.length);
      expect(categories.map(c => c.name)).toEqual(expect.arrayContaining(expectedCategories));
    });
  });
});
