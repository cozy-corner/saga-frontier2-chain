// backend/src/test/setup/testDatabase.ts
import neo4j, { Driver } from 'neo4j-driver';
import { testCategories, testSkills, testLinkage } from './testData';

// Define types for Neo4j mocks
type Neo4jNodeProperty = string | number | boolean | null | undefined;
type Neo4jNodeProperties = Record<string, Neo4jNodeProperty>;
type Neo4jQueryParams = Record<string, string | number | boolean | null>;
type MockSession = {
  run: jest.Mock;
  close: jest.Mock;
};
type MockDriver = {
  session: jest.Mock;
  verifyConnectivity: jest.Mock;
  close: jest.Mock;
};
type MockRecord = {
  get: jest.Mock;
};

// Mock implementation of Neo4j driver and session
let mockDriver: MockDriver;
let mockSession: MockSession;

/**
 * Initialize mock Neo4j driver for testing
 */
export const initTestDriver = (): MockDriver => {
  // Reset mock responses for each test
  mockSession = {
    run: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  };

  mockDriver = {
    session: jest.fn().mockReturnValue(mockSession),
    verifyConnectivity: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  };

  // Spy on neo4j.driver to return our mock
  jest.spyOn(neo4j, 'driver').mockReturnValue(mockDriver as unknown as Driver);

  return mockDriver;
};

/**
 * Helper to create a Neo4j record with node properties
 */
const createMockRecord = (alias: string, properties: Neo4jNodeProperties): MockRecord => {
  return {
    get: jest.fn((key) => {
      if (key === alias) {
        return {
          properties
        };
      }
      return null;
    }),
  };
};

/**
 * Setup all mock responses for testing
 */
export const setupAllMocks = (): void => {
  // Universal mock for neo4j session.run that handles all queries based on patterns
  mockSession.run.mockImplementation((query: string, params: Neo4jQueryParams = {}) => {
    // Category queries
    if (query.includes('MATCH (c:Category)') && !query.includes('WHERE')) {
      // findAllCategories
      const records = testCategories.map(category => 
        createMockRecord('c', { name: category.name })
      );
      
      return Promise.resolve({
        records
      });
    }
    
    if (query.includes('MATCH (c:Category {name: $name})')) {
      // findCategoryByName
      const category = testCategories.find(c => c.name === params.name);
      
      if (category) {
        return Promise.resolve({
          records: [createMockRecord('c', { name: category.name })]
        });
      }
      
      return Promise.resolve({ records: [] });
    }
    
    // Skill queries
    if (query.includes('MATCH (c:Category {name: $categoryName})<-[:BELONGS_TO]-(s:Skill)')) {
      // findSkillsByCategory
      const skills = testSkills.filter(skill => skill.categoryName === params.categoryName);
      
      const records = skills.map(skill => 
        createMockRecord('s', { name: skill.name })
      );
      
      return Promise.resolve({
        records
      });
    }
    
    if (query.includes('MATCH (s:Skill)') && !query.includes('WHERE')) {
      // findSkills (all)
      const records = testSkills.map(skill => 
        createMockRecord('s', { name: skill.name })
      );
      
      return Promise.resolve({
        records
      });
    }
    
    if (query.includes('MATCH (s:Skill {name: $name})') && !query.includes('->')) {
      // findSkillByName
      const skill = testSkills.find(s => s.name === params.name);
      
      if (skill) {
        return Promise.resolve({
          records: [createMockRecord('s', { name: skill.name })]
        });
      }
      
      return Promise.resolve({ records: [] });
    }
    
    // Relationship queries
    if (query.includes('MATCH (s:Skill {name: $skillName})-[:BELONGS_TO]->(c:Category)')) {
      // findCategoryForSkill
      const skill = testSkills.find(s => s.name === params.skillName);
      
      if (skill) {
        const category = testCategories.find(c => c.name === skill.categoryName);
        
        if (category) {
          return Promise.resolve({
            records: [createMockRecord('c', { name: category.name })]
          });
        }
      }
      
      return Promise.resolve({ records: [] });
    }
    
    if (query.includes('MATCH (s:Skill {name: $skillName})-[:LINKS_TO]->(linked:Skill)')) {
      // findSkillsLinkedFrom
      const links = testLinkage.filter(link => link.sourceSkill === params.skillName);
      
      const targetSkillNames = links.map(link => link.targetSkill);
      const linkedSkills = testSkills.filter(skill => targetSkillNames.includes(skill.name));
      
      const records = linkedSkills.map(skill => 
        createMockRecord('linked', { name: skill.name })
      );
      
      return Promise.resolve({
        records
      });
    }
    
    if (query.includes('MATCH (s:Skill {name: $skillName})<-[:LINKS_TO]-(linker:Skill)')) {
      // findSkillsLinkedTo
      const links = testLinkage.filter(link => link.targetSkill === params.skillName);
      
      const sourceSkillNames = links.map(link => link.sourceSkill);
      const linkedSkills = testSkills.filter(skill => sourceSkillNames.includes(skill.name));
      
      const records = linkedSkills.map(skill => 
        createMockRecord('linker', { name: skill.name })
      );
      
      return Promise.resolve({
        records
      });
    }
    
    if (query.includes('MATCH (s:Skill {name: $skillName})-[:LINKS_TO]->(:Skill)-[:BELONGS_TO]->(c:Category)')) {
      // findLinkedFromCategories
      const links = testLinkage.filter(link => link.sourceSkill === params.skillName);
      const targetSkillNames = links.map(link => link.targetSkill);
      const targetSkills = testSkills.filter(skill => targetSkillNames.includes(skill.name));
      const categoryNames = [...new Set(targetSkills.map(skill => skill.categoryName))];
      const categories = testCategories.filter(category => categoryNames.includes(category.name));
      
      const records = categories.map(category => 
        createMockRecord('c', { name: category.name })
      );
      
      return Promise.resolve({
        records
      });
    }
    
    if (query.includes('MATCH (s:Skill {name: $skillName})<-[:LINKS_TO]-(:Skill)-[:BELONGS_TO]->(c:Category)')) {
      // findLinkedToCategories
      const links = testLinkage.filter(link => link.targetSkill === params.skillName);
      const sourceSkillNames = links.map(link => link.sourceSkill);
      const sourceSkills = testSkills.filter(skill => sourceSkillNames.includes(skill.name));
      const categoryNames = [...new Set(sourceSkills.map(skill => skill.categoryName))];
      const categories = testCategories.filter(category => categoryNames.includes(category.name));
      
      const records = categories.map(category => 
        createMockRecord('c', { name: category.name })
      );
      
      return Promise.resolve({
        records
      });
    }
    
    // Default response for unhandled queries
    return Promise.resolve({ records: [] });
  });
};

// Create aliases for the individual setup functions (for backward compatibility)
export const setupCategoryMocks = (): void => setupAllMocks();
export const setupSkillMocks = (): void => setupAllMocks();
export const setupRelationshipMocks = (): void => setupAllMocks();

/**
 * Reset mocks between tests
 */
export const resetMocks = (): void => {
  if (mockSession) {
    mockSession.run.mockReset();
    mockSession.close.mockReset();
  }
  
  if (mockDriver) {
    mockDriver.session.mockReset();
    mockDriver.verifyConnectivity.mockReset();
    mockDriver.close.mockReset();
  }
};
