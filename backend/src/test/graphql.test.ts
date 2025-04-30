// backend/src/test/graphql.test.ts
import { ApolloServer } from 'apollo-server';
import { typeDefs, resolvers } from '../schema';
import { testCategories, testSkills, testLinkage } from './setup/testData';
import { setupRepositoryMocks, resetRepositoryMocks } from './mock/repositoryMock';

describe('GraphQL Schema', () => {
  let server: ApolloServer;
  
  beforeEach(() => {
    // Directly mock repository functions
    setupRepositoryMocks();
    
    // Create Apollo Server instance with our schema
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });
  
  afterEach(() => {
    // Reset all mocks between tests
    resetRepositoryMocks();
    jest.clearAllMocks();
  });
  
  describe('Queries', () => {
    test('categories query returns all categories', async () => {
      const query = `
        query {
          categories {
            name
          }
        }
      `;
      
      const result = await server.executeOperation({ query });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.categories).toHaveLength(testCategories.length);
      
      const categoryNames = result.data?.categories.map((c: any) => c.name);
      expect(categoryNames).toEqual(expect.arrayContaining(testCategories.map(c => c.name)));
    });
    
    test('category query returns a specific category', async () => {
      const categoryName = '剣';
      
      const query = `
        query GetCategory($name: String!) {
          category(name: $name) {
            name
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { name: categoryName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.category).not.toBeNull();
      expect(result.data?.category.name).toBe(categoryName);
    });
    
    test('skills query returns all skills', async () => {
      const query = `
        query {
          skills {
            name
          }
        }
      `;
      
      const result = await server.executeOperation({ query });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.skills).toHaveLength(testSkills.length);
      
      const skillNames = result.data?.skills.map((s: any) => s.name);
      expect(skillNames).toEqual(expect.arrayContaining(testSkills.map(s => s.name)));
    });
    
    test('skills query filters by category', async () => {
      const categoryName = '体';
      const expectedSkills = testSkills.filter(s => s.categoryName === categoryName);
      
      const query = `
        query GetSkillsByCategory($categoryName: String) {
          skills(categoryName: $categoryName) {
            name
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { categoryName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.skills).toHaveLength(expectedSkills.length);
      
      const skillNames = result.data?.skills.map((s: any) => s.name);
      expect(skillNames).toEqual(expect.arrayContaining(expectedSkills.map(s => s.name)));
    });
    
    test('skill query returns a specific skill', async () => {
      const skillName = '裏拳';
      
      const query = `
        query GetSkill($name: String!) {
          skill(name: $name) {
            name
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { name: skillName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.skill).not.toBeNull();
      expect(result.data?.skill.name).toBe(skillName);
    });
    
    test('linkedFromCategories query returns categories of skills linked from a skill', async () => {
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
      
      const query = `
        query GetLinkedCategories($skillName: String!) {
          linkedFromCategories(skillName: $skillName) {
            name
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { skillName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.linkedFromCategories).toHaveLength(expectedCategories.length);
      
      const categoryNames = result.data?.linkedFromCategories.map((c: any) => c.name);
      expect(categoryNames).toEqual(expect.arrayContaining(expectedCategories));
    });
  });
  
  describe('Nested resolvers', () => {
    test('Skill.category resolver returns the category a skill belongs to', async () => {
      const skillName = '裏拳';
      const expectedCategoryName = testSkills.find(s => s.name === skillName)?.categoryName;
      
      const query = `
        query GetSkillWithCategory($name: String!) {
          skill(name: $name) {
            name
            category {
              name
            }
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { name: skillName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.skill.category).not.toBeNull();
      expect(result.data?.skill.category.name).toBe(expectedCategoryName);
    });
    
    test('Skill.linksTo resolver returns skills that a skill links to', async () => {
      const skillName = '裏拳';
      const expectedLinks = testLinkage
        .filter(link => link.sourceSkill === skillName)
        .map(link => link.targetSkill);
      
      const query = `
        query GetSkillWithLinks($name: String!) {
          skill(name: $name) {
            name
            linksTo {
              name
            }
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { name: skillName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.skill.linksTo).toHaveLength(expectedLinks.length);
      
      const linkedSkillNames = result.data?.skill.linksTo.map((s: any) => s.name);
      expect(linkedSkillNames).toEqual(expect.arrayContaining(expectedLinks));
    });
    
    test('Skill.linkedBy resolver returns skills that link to a skill', async () => {
      const skillName = '十字切り';
      const expectedLinks = testLinkage
        .filter(link => link.targetSkill === skillName)
        .map(link => link.sourceSkill);
      
      const query = `
        query GetSkillWithLinkedBy($name: String!) {
          skill(name: $name) {
            name
            linkedBy {
              name
            }
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { name: skillName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.skill.linkedBy).toHaveLength(expectedLinks.length);
      
      const linkedSkillNames = result.data?.skill.linkedBy.map((s: any) => s.name);
      expect(linkedSkillNames).toEqual(expect.arrayContaining(expectedLinks));
    });
    
    test('Category.skills resolver returns skills belonging to a category', async () => {
      const categoryName = '剣';
      const expectedSkills = testSkills.filter(s => s.categoryName === categoryName);
      
      const query = `
        query GetCategoryWithSkills($name: String!) {
          category(name: $name) {
            name
            skills {
              name
            }
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { name: categoryName },
      });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.category.skills).toHaveLength(expectedSkills.length);
      
      const skillNames = result.data?.category.skills.map((s: any) => s.name);
      expect(skillNames).toEqual(expect.arrayContaining(expectedSkills.map(s => s.name)));
    });
  });
  
  describe('Complex queries', () => {
    test('GetLinkedSkills query returns linked skills filtered by category', async () => {
      const skillName = '裏拳';
      const categoryName = '剣';
      
      // Find skills linked from '裏拳' that belong to the '剣' category
      const expectedLinkedSkills = testLinkage
        .filter(link => link.sourceSkill === skillName)
        .map(link => link.targetSkill)
        .filter(targetSkill => {
          const skill = testSkills.find(s => s.name === targetSkill);
          return skill?.categoryName === categoryName;
        });
      
      const query = `
        query GetLinkedSkills($skillName: String!, $categoryName: String!) {
          skill(name: $skillName) {
            name
            linksTo {
              name
              category {
                name
              }
            }
          }
          category(name: $categoryName) {
            name
          }
        }
      `;
      
      const result = await server.executeOperation({
        query,
        variables: { skillName, categoryName },
      });
      
      expect(result.errors).toBeUndefined();
      
      // Filter linked skills by the requested category
      const linkedSkills = result.data?.skill.linksTo.filter(
        (skill: any) => skill.category?.name === categoryName
      );
      
      expect(linkedSkills).toHaveLength(expectedLinkedSkills.length);
      
      const linkedSkillNames = linkedSkills.map((s: any) => s.name);
      expect(linkedSkillNames).toEqual(expect.arrayContaining(expectedLinkedSkills));
    });
  });
});
