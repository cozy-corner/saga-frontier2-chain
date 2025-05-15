// backend/src/test/mock/repositoryMock.ts
import * as repository from '../../infrastructure/neo4jRepository';
import { CategoryType, SkillType } from '../../model/types';
import { testCategories, testSkills, testLinkage } from '../setup/testData';
import { Driver } from 'neo4j-driver';

/**
 * Setup complete mocks for all repository functions
 */
export function setupRepositoryMocks() {
  // Mock the repository functions directly to avoid session.close() issues
  jest.spyOn(repository, 'findAllCategories').mockImplementation(async (): Promise<CategoryType[]> => {
    return testCategories.map(cat => ({ 
      name: cat.name,
      order: cat.order,
      skills: [] 
    }));
  });

  jest.spyOn(repository, 'findCategoryByName').mockImplementation(async (name: string): Promise<CategoryType | null> => {
    const category = testCategories.find(c => c.name === name);
    if (!category) return null;
    return { 
      name: category.name,
      order: category.order, 
      skills: [] 
    };
  });

  jest.spyOn(repository, 'findSkills').mockImplementation(async (categoryName?: string): Promise<SkillType[]> => {
    let filteredSkills = testSkills;
    if (categoryName) {
      filteredSkills = testSkills.filter(skill => skill.categoryName === categoryName);
    }
    return filteredSkills.map(skill => {
      const category = testCategories.find(c => c.name === skill.categoryName);
      return { 
        type: 'waza', // 全てのスキルを技として扱う
        name: skill.name, 
        wp: 0, // デフォルト値
        linksTo: [],
        category: {
          name: skill.categoryName,
          order: category?.order || 0,
          skills: []
        }
      };
    });
  });

  jest.spyOn(repository, 'findSkillByName').mockImplementation(async (name: string): Promise<SkillType | null> => {
    const skill = testSkills.find(s => s.name === name);
    if (!skill) return null;
    
    const category = testCategories.find(c => c.name === skill.categoryName);
    return { 
      type: 'waza', // 全てのスキルを技として扱う
      name: skill.name, 
      wp: 0, // デフォルト値
      linksTo: [],
      category: {
        name: skill.categoryName,
        order: category?.order || 0,
        skills: []
      }
    };
  });

  jest.spyOn(repository, 'findSkillsForCategory').mockImplementation(async (categoryName: string): Promise<SkillType[]> => {
    const skills = testSkills.filter(skill => skill.categoryName === categoryName);
    const category = testCategories.find(c => c.name === categoryName);
    
    return skills.map(skill => ({ 
      type: 'waza', // 全てのスキルを技として扱う
      name: skill.name, 
      wp: 0, // デフォルト値
      linksTo: [],
      category: {
        name: categoryName,
        order: category?.order || 0,
        skills: []
      }
    }));
  });

  jest.spyOn(repository, 'findCategoryForSkill').mockImplementation(async (skillName: string): Promise<CategoryType | null> => {
    const skill = testSkills.find(s => s.name === skillName);
    if (!skill) return null;
    
    const category = testCategories.find(c => c.name === skill.categoryName);
    if (!category) return null;
    
    return { 
      name: category.name,
      order: category.order, 
      skills: [] 
    };
  });

  jest.spyOn(repository, 'findSkillsLinkedFrom').mockImplementation(async (skillName: string): Promise<SkillType[]> => {
    const links = testLinkage.filter(link => link.sourceSkill === skillName);
    const targetSkillNames = links.map(link => link.targetSkill);
    const linkedSkills = testSkills.filter(skill => targetSkillNames.includes(skill.name));
    
    return linkedSkills.map(skill => {
      const category = testCategories.find(c => c.name === skill.categoryName);
      return { 
        type: 'waza', // 全てのスキルを技として扱う
        name: skill.name, 
        wp: 0, // デフォルト値
        linksTo: [],
        category: {
          name: skill.categoryName,
          order: category?.order || 0,
          skills: []
        }
      };
    });
  });

  jest.spyOn(repository, 'findSkillsLinkedTo').mockImplementation(async (skillName: string): Promise<SkillType[]> => {
    const links = testLinkage.filter(link => link.targetSkill === skillName);
    const sourceSkillNames = links.map(link => link.sourceSkill);
    const linkedSkills = testSkills.filter(skill => sourceSkillNames.includes(skill.name));
    
    return linkedSkills.map(skill => {
      const category = testCategories.find(c => c.name === skill.categoryName);
      return { 
        type: 'waza', // 全てのスキルを技として扱う
        name: skill.name, 
        wp: 0, // デフォルト値
        linksTo: [],
        category: {
          name: skill.categoryName,
          order: category?.order || 0,
          skills: []
        }
      };
    });
  });

  jest.spyOn(repository, 'findLinkedFromCategories').mockImplementation(async (skillName: string): Promise<CategoryType[]> => {
    const links = testLinkage.filter(link => link.sourceSkill === skillName);
    const targetSkillNames = links.map(link => link.targetSkill);
    const targetSkills = testSkills.filter(skill => targetSkillNames.includes(skill.name));
    const categoryNames = [...new Set(targetSkills.map(skill => skill.categoryName))];
    
    return categoryNames.map(name => {
      const category = testCategories.find(c => c.name === name);
      return { 
        name, 
        order: category?.order || 0,
        skills: [] 
      };
    });
  });

  jest.spyOn(repository, 'findLinkedToCategories').mockImplementation(async (skillName: string): Promise<CategoryType[]> => {
    const links = testLinkage.filter(link => link.targetSkill === skillName);
    const sourceSkillNames = links.map(link => link.sourceSkill);
    const sourceSkills = testSkills.filter(skill => sourceSkillNames.includes(skill.name));
    const categoryNames = [...new Set(sourceSkills.map(skill => skill.categoryName))];
    
    return categoryNames.map(name => {
      const category = testCategories.find(c => c.name === name);
      return { 
        name, 
        order: category?.order || 0,
        skills: [] 
      };
    });
  });

  // Leave getDriver mocked as a no-op since we're bypassing it
  jest.spyOn(repository, 'getDriver').mockImplementation(() => {
    return {} as Driver;
  });
}

/**
 * Reset all repository mocks
 */
export function resetRepositoryMocks() {
  jest.restoreAllMocks();
}
