// backend/src/test/mock/neo4jMock.ts
import neo4j, { Driver } from 'neo4j-driver';
import { testCategories, testSkills, testLinkage } from '../setup/testData';

// Define types for Neo4j mocks
type Neo4jNodeProperty = string | number | boolean | null | undefined;
type Neo4jNodeProperties = Record<string, Neo4jNodeProperty>;
type Neo4jQueryParams = Record<string, string | number | boolean | null>;
type MockRecord = {
  get: jest.Mock;
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
 * Create a unified mock implementation for Neo4j queries
 */
const createQueryHandler = () => {
  return jest.fn((query: string, params: Neo4jQueryParams = {}) => {
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

/**
 * Setup Neo4j Driver, Session, and Transaction mocks
 */
export function setupNeo4jMock() {
  // Create a mock session that will handle all query patterns
  const mockSessionRun = createQueryHandler();
  
  // Create a real mock session that can be closed
  const mockSession = {
    run: mockSessionRun,
    close: jest.fn().mockResolvedValue(undefined),
  };
  
  // Create a mock driver that returns our mock session
  const mockDriver = {
    session: jest.fn().mockReturnValue(mockSession),
    verifyConnectivity: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  };
  
  // Mock the neo4j.driver factory function
  jest.spyOn(neo4j, 'driver').mockReturnValue(mockDriver as unknown as Driver);
  
  return {
    driver: mockDriver,
    session: mockSession,
    run: mockSessionRun
  };
}

/**
 * Clean up Neo4j mocks
 */
export function resetNeo4jMock() {
  jest.restoreAllMocks();
}
