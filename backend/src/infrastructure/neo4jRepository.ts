import neo4j, { Driver, Record as Neo4jRecord } from 'neo4j-driver';
import { SkillType, CategoryType } from '../model/types';

// Define categories to be excluded from results
const EXCLUDED_CATEGORIES = ['基本術', '固有技', '固有術', '敵'];

// --- Neo4j Driver Setup ---

// Consider moving connection details to environment variables for security and flexibility
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
// const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
// const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || ''; // Add password if set

let driver: Driver;

/**
 * Initializes and returns the Neo4j Driver instance (singleton pattern).
 */
export const getDriver = (): Driver => {
  if (!driver) {
    console.log(`Connecting to Neo4j at ${NEO4J_URI}`);
    driver = neo4j.driver(
      NEO4J_URI,
      // neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD) // Uncomment if authentication is enabled
    );

    // Verify connection during initialization (optional but recommended)
    driver.verifyConnectivity()
      .then(() => console.log('Neo4j Driver connected successfully.'))
      .catch(error => console.error('Neo4j Driver connection error:', error));
  }
  return driver;
};

/**
 * Closes the Neo4j Driver connection. Call this on application shutdown.
 */
export const closeDriver = async (): Promise<void> => {
  if (driver) {
    console.log('Closing Neo4j Driver connection.');
    await driver.close();
    // driver = undefined; // Reset driver instance if needed
  }
};

// --- Helper Functions ---

/**
 * Extracts properties from a Neo4j Node within a Record, handling potential nulls.
 * @param record - The Neo4j Record object.
 * @param alias - The alias used for the node in the Cypher query (e.g., 'c', 's').
 * @returns The node's properties object or null if the node/record is null.
 */
// Helper to convert raw data to CategoryType
const toCategoryType = (data: Record<string, unknown> | null): CategoryType | null => {
  if (!data) return null;
  return { 
    name: data.name as string,
    order: typeof data.order === 'number' ? data.order as number : 0, // Default to 0 if order is not set
    skills: [] // NOTE: Empty array is intentional. Skills are loaded on-demand by the GraphQL resolver
               // in schema.ts (Category.skills resolver) rather than eagerly loaded here.
  };
};

// Helper to convert raw data to SkillType
const toSkillType = (data: Record<string, unknown> | null): SkillType | null => {
  if (!data) return null;
  
  const name = data.name as string;
  const type = data.type as 'waza' | 'jutsuwaza' | 'jutsu' || 'waza';
  
  if (type === 'waza') {
    return {
      type: 'waza',
      name: name,
      wp: typeof data.wp === 'number' ? data.wp as number : 0,
      linksTo: [] // NOTE: Empty array is intentional. LinkTo relationships are loaded on-demand
               // by the GraphQL resolver in schema.ts (Skill.linksTo resolver) rather than eagerly loaded here.
    };
  } else if (type === 'jutsuwaza') {
    return {
      type: 'jutsuwaza',
      name: name,
      jp: typeof data.jp === 'number' ? data.jp as number : 0,
      linksTo: []
    };
  } else { // jutsu
    return {
      type: 'jutsu',
      name: name,
      jp: typeof data.jp === 'number' ? data.jp as number : 0,
      linksTo: []
    };
  }
};

const extractNodeProps = (record: Neo4jRecord | null | undefined, alias: string): Record<string, unknown> | null => {
    if (!record) return null;
    try {
        const node = record.get(alias);
        return node ? node.properties : null;
    } catch (error) {
        console.error(`Error extracting properties for alias ${alias}:`, error);
        return null;
    }
};

/**
 * Extracts properties from a list of Neo4j Records for a specific node alias.
 * Filters out any null results.
 * @param records - An array of Neo4j Record objects.
 * @param alias - The alias used for the node in the Cypher query.
 * @returns An array of node properties objects.
 */
const extractNodePropsList = (records: Neo4jRecord[], alias: string): Record<string, unknown>[] => {
    return records.map(record => extractNodeProps(record, alias)).filter(props => props !== null);
};

/**
 * Converts a Neo4j Record to a SkillType object with category information.
 * @param record - The Neo4j Record object.
 * @param alias - The alias used for the node in the Cypher query (e.g., 's', 'linked', 'linker').
 * @returns The SkillType object or null if conversion fails.
 */
const recordToSkill = (record: Neo4jRecord, alias: string): SkillType | null => {
  const skillProps = extractNodeProps(record, alias);
  if (!skillProps) return null;

  const categoryName  = record.get('categoryName')  as string;
  const categoryOrder = record.get('categoryOrder') as number | undefined;

  const skill = toSkillType(skillProps);
  if (!skill) return null;

  skill.category = {
    name  : categoryName,
    order : typeof categoryOrder === 'number' ? categoryOrder : 0,
    skills: [],
  };
  return skill;
};


// --- Repository Functions ---

/**
 * Fetches all Category nodes, excluding the specified categories.
 */
export const findAllCategories = async (): Promise<CategoryType[]> => {
  const currentDriver = getDriver();
  const session = currentDriver.session();
  try {
    // Filter out excluded categories directly in the Cypher query
    const result = await session.run(
      'MATCH (c:Category) WHERE NOT c.name IN $excludedCategories RETURN c ORDER BY c.order, c.name',
      { excludedCategories: EXCLUDED_CATEGORIES }
    );
    const rawData = extractNodePropsList(result.records, 'c');
    return rawData.map(data => toCategoryType(data)).filter((cat): cat is CategoryType => cat !== null);
  } finally {
    await session.close();
  }
};

/**
 * Fetches a specific Category node by name, returns null if it belongs to excluded categories.
 */
export const findCategoryByName = async (name: string): Promise<CategoryType | null> => {
  // Immediately return null if the category is in the excluded list
  if (EXCLUDED_CATEGORIES.includes(name)) {
    return null;
  }
  
  const currentDriver = getDriver();
  const session = currentDriver.session();
  try {
    const result = await session.run('MATCH (c:Category {name: $name}) RETURN c', { name });
    const rawData = extractNodeProps(result.records[0], 'c');
    return toCategoryType(rawData);
  } finally {
    await session.close();
  }
};

/**
 * Fetches Skill nodes, optionally filtered by category name, excluding skills from excluded categories.
 */
export const findSkills = async (categoryName?: string): Promise<SkillType[]> => {
  // Immediately return empty array if the specified category is in the excluded list
  if (categoryName && EXCLUDED_CATEGORIES.includes(categoryName)) {
    return [];
  }

  const currentDriver = getDriver();
  const session = currentDriver.session();
  try {
    let query: string;
    const params: { categoryName?: string, excludedCategories?: string[] } = {};

    if (categoryName) {
      // Query skills for a specific category
      query = `
        MATCH (c:Category {name: $categoryName})<-[:BELONGS_TO]-(s:Skill) 
        RETURN s, c.name AS categoryName, c.order AS categoryOrder 
        ORDER BY c.order, 
                 CASE s.type 
                   WHEN 'waza' THEN 1 
                   WHEN 'jutsuwaza' THEN 2 
                   ELSE 3 
                 END,
                 CASE WHEN s.type = 'waza' THEN s.wp ELSE s.jp END,  
                 s.name
      `;
      params.categoryName = categoryName;
    } else {
      // Query all skills, but exclude those from excluded categories
      query = `
        MATCH (s:Skill)-[:BELONGS_TO]->(c:Category)
        WHERE NOT c.name IN $excludedCategories
        RETURN s, c.name AS categoryName, c.order AS categoryOrder
        ORDER BY c.order, 
                 CASE s.type 
                   WHEN 'waza' THEN 1 
                   WHEN 'jutsuwaza' THEN 2 
                   ELSE 3 
                 END,
                 CASE WHEN s.type = 'waza' THEN s.wp ELSE s.jp END,  
                 s.name
      `;
      params.excludedCategories = EXCLUDED_CATEGORIES;
    }

    const result = await session.run(query, params);
    
    // Process results to include category information
    const skills = result.records
      .map(r => recordToSkill(r, 's'))
      .filter((s): s is SkillType => s !== null);
    
    return skills;
  } finally {
    await session.close();
  }
};

/**
 * Fetches a specific Skill node by name, returns null if it belongs to an excluded category.
 */
export const findSkillByName = async (name: string): Promise<SkillType | null> => {
  const currentDriver = getDriver();
  const session = currentDriver.session();
  try {
    // Modified query to also fetch the category to check for exclusions
    const result = await session.run(
      `MATCH (s:Skill {name: $name})-[:BELONGS_TO]->(c:Category)
       RETURN s, c.name AS categoryName, c.order AS categoryOrder`,
      { name }
    );
    
    // If no result found, return null
    if (!result.records || result.records.length === 0) {
      return null;
    }
    
    // Check if the skill belongs to an excluded category
    const categoryName = result.records[0].get('categoryName');
    if (EXCLUDED_CATEGORIES.includes(categoryName)) {
      return null;
    }
    
    return recordToSkill(result.records[0], 's');
  } finally {
    await session.close();
  }
};

/**
 * Fetches the Category a specific Skill belongs to, returns null if it's an excluded category.
 */
export const findCategoryForSkill = async (skillName: string): Promise<CategoryType | null> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
      const result = await session.run(
        'MATCH (s:Skill {name: $skillName})-[:BELONGS_TO]->(c:Category) RETURN c',
        { skillName }
      );
      const rawData = extractNodeProps(result.records[0], 'c');
      if (!rawData) return null;
      
      // Return null if the category is in the excluded list
      if (EXCLUDED_CATEGORIES.includes(rawData.name as string)) {
        return null;
      }
      
      return toCategoryType(rawData);
    } finally {
      await session.close();
    }
};

/**
 * Fetches Skills that a specific Skill links to, excluding skills from excluded categories.
 */
export const findSkillsLinkedFrom = async (skillName: string): Promise<SkillType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
      const result = await session.run(
        `MATCH (s:Skill {name: $skillName})-[:LINKS_TO]->(linked:Skill)-[:BELONGS_TO]->(c:Category)
         WHERE NOT c.name IN $excludedCategories
         RETURN linked, c.name AS categoryName, c.order AS categoryOrder
         ORDER BY c.order, 
                  CASE linked.type 
                    WHEN 'waza' THEN 1 
                    WHEN 'jutsuwaza' THEN 2 
                    ELSE 3 
                  END,
                  CASE WHEN linked.type = 'waza' THEN linked.wp ELSE linked.jp END,  
                  linked.name`,
        { skillName, excludedCategories: EXCLUDED_CATEGORIES }
      );
      
      // Process results to include category information
      const skills = result.records
        .map(r => recordToSkill(r, 'linked'))
        .filter((s): s is SkillType => s !== null);
      
      return skills;
    } finally {
      await session.close();
    }
};

/**
 * Fetches Skills that link to a specific Skill, excluding skills from excluded categories.
 */
export const findSkillsLinkedTo = async (skillName: string): Promise<SkillType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
      const result = await session.run(
        `MATCH (s:Skill {name: $skillName})<-[:LINKS_TO]-(linker:Skill)-[:BELONGS_TO]->(c:Category)
         WHERE NOT c.name IN $excludedCategories
         RETURN linker, c.name AS categoryName, c.order AS categoryOrder
         ORDER BY c.order, 
                  CASE linker.type 
                    WHEN 'waza' THEN 1 
                    WHEN 'jutsuwaza' THEN 2 
                    ELSE 3 
                  END,
                  CASE WHEN linker.type = 'waza' THEN linker.wp ELSE linker.jp END,  
                  linker.name`,
        { skillName, excludedCategories: EXCLUDED_CATEGORIES }
      );
      
      // Process results to include category information
      const skills = result.records
        .map(r => recordToSkill(r, 'linker'))
        .filter((s): s is SkillType => s !== null);
      
      return skills;
    } finally {
      await session.close();
    }
};

/**
 * Fetches Skills belonging to a specific Category, returns empty array for excluded categories.
 */
export const findSkillsForCategory = async (categoryName: string): Promise<SkillType[]> => {
    // Immediately return empty array if the category is in the excluded list
    if (EXCLUDED_CATEGORIES.includes(categoryName)) {
        return [];
    }
    
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
        const result = await session.run(
            `MATCH (c:Category {name: $categoryName})<-[:BELONGS_TO]-(s:Skill) 
            RETURN s, c.name AS categoryName, c.order AS categoryOrder 
            ORDER BY c.order, 
                     CASE s.type 
                       WHEN 'waza' THEN 1 
                       WHEN 'jutsuwaza' THEN 2 
                       ELSE 3 
                     END,
                     CASE WHEN s.type = 'waza' THEN s.wp ELSE s.jp END,  
                     s.name`,
            { categoryName }
        );
        
        // Process results to include category information
        const skills = result.records
          .map(r => recordToSkill(r, 's'))
          .filter((s): s is SkillType => s !== null);
        
        return skills;
    } finally {
        await session.close();
    }
};

/**
 * Fetches distinct Categories of Skills linked *from* a specific Skill, excluding specified categories.
 */
export const findLinkedFromCategories = async (skillName: string): Promise<CategoryType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
        const result = await session.run(
            `MATCH (s:Skill {name: $skillName})-[:LINKS_TO]->(:Skill)-[:BELONGS_TO]->(c:Category)
             WHERE NOT c.name IN $excludedCategories
             RETURN DISTINCT c ORDER BY c.order, c.name`,
            { skillName, excludedCategories: EXCLUDED_CATEGORIES }
        );
        const rawData = extractNodePropsList(result.records, 'c');
        return rawData.map(data => toCategoryType(data)).filter((cat): cat is CategoryType => cat !== null);
    } finally {
        await session.close();
    }
};

/**
 * Fetches distinct Categories of Skills linked *to* a specific Skill, excluding specified categories.
 */
export const findLinkedToCategories = async (skillName: string): Promise<CategoryType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
        const result = await session.run(
            `MATCH (s:Skill {name: $skillName})<-[:LINKS_TO]-(:Skill)-[:BELONGS_TO]->(c:Category)
             WHERE NOT c.name IN $excludedCategories
             RETURN DISTINCT c ORDER BY c.order, c.name`,
            { skillName, excludedCategories: EXCLUDED_CATEGORIES }
        );
        const rawData = extractNodePropsList(result.records, 'c');
        return rawData.map(data => toCategoryType(data)).filter((cat): cat is CategoryType => cat !== null);
    } finally {
        await session.close();
    }
};
