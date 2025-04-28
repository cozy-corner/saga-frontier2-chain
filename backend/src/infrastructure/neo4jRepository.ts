import neo4j, { Driver, Record as Neo4jRecord } from 'neo4j-driver';
import { SkillType, CategoryType } from '../model/types';

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
    skills: [] 
  };
};

// Helper to convert raw data to SkillType
const toSkillType = (data: Record<string, unknown> | null): SkillType | null => {
  if (!data) return null;
  return { 
    name: data.name as string, 
    linksTo: [] 
  };
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


// --- Repository Functions ---

/**
 * Fetches all Category nodes.
 */
export const findAllCategories = async (): Promise<CategoryType[]> => {
  const currentDriver = getDriver();
  const session = currentDriver.session();
  try {
    const result = await session.run('MATCH (c:Category) RETURN c ORDER BY c.name');
    const rawData = extractNodePropsList(result.records, 'c');
    return rawData.map(data => toCategoryType(data)).filter((cat): cat is CategoryType => cat !== null);
  } finally {
    await session.close();
  }
};

/**
 * Fetches a specific Category node by name.
 */
export const findCategoryByName = async (name: string): Promise<CategoryType | null> => {
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
 * Fetches Skill nodes, optionally filtered by category name.
 */
export const findSkills = async (categoryName?: string): Promise<SkillType[]> => {
  const currentDriver = getDriver();
  const session = currentDriver.session();
  try {
    let query: string;
    const params: { categoryName?: string } = {};

    if (categoryName) {
      // Optional: Check if category exists first for better error handling
      // const categoryCheck = await session.run('MATCH (c:Category {name: $categoryName}) RETURN c LIMIT 1', { categoryName });
      // if (categoryCheck.records.length === 0) {
      //     throw new Error(`Category "${categoryName}" not found.`);
      // }
      query = 'MATCH (c:Category {name: $categoryName})<-[:BELONGS_TO]-(s:Skill) RETURN s ORDER BY s.name';
      params.categoryName = categoryName;
    } else {
      query = 'MATCH (s:Skill) RETURN s ORDER BY s.name';
    }

    const result = await session.run(query, params);
    const rawData = extractNodePropsList(result.records, 's');
    return rawData.map(data => toSkillType(data)).filter((skill): skill is SkillType => skill !== null);
  } finally {
    await session.close();
  }
};

/**
 * Fetches a specific Skill node by name.
 */
export const findSkillByName = async (name: string): Promise<SkillType | null> => {
  const currentDriver = getDriver();
  const session = currentDriver.session();
  try {
    const result = await session.run('MATCH (s:Skill {name: $name}) RETURN s', { name });
    const rawData = extractNodeProps(result.records[0], 's');
    return toSkillType(rawData);
  } finally {
    await session.close();
  }
};

/**
 * Fetches the Category a specific Skill belongs to.
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
      return toCategoryType(rawData);
    } finally {
      await session.close();
    }
};

/**
 * Fetches Skills that a specific Skill links to.
 */
export const findSkillsLinkedFrom = async (skillName: string): Promise<SkillType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
      const result = await session.run(
        'MATCH (s:Skill {name: $skillName})-[:LINKS_TO]->(linked:Skill) RETURN linked ORDER BY linked.name',
        { skillName }
      );
      const rawData = extractNodePropsList(result.records, 'linked');
      return rawData.map(data => toSkillType(data)).filter((skill): skill is SkillType => skill !== null);
    } finally {
      await session.close();
    }
};

/**
 * Fetches Skills that link to a specific Skill.
 */
export const findSkillsLinkedTo = async (skillName: string): Promise<SkillType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
      const result = await session.run(
        'MATCH (s:Skill {name: $skillName})<-[:LINKS_TO]-(linker:Skill) RETURN linker ORDER BY linker.name',
        { skillName }
      );
      const rawData = extractNodePropsList(result.records, 'linker');
      return rawData.map(data => toSkillType(data)).filter((skill): skill is SkillType => skill !== null);
    } finally {
      await session.close();
    }
};

/**
 * Fetches Skills belonging to a specific Category.
 */
export const findSkillsForCategory = async (categoryName: string): Promise<SkillType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
        const result = await session.run(
            'MATCH (c:Category {name: $categoryName})<-[:BELONGS_TO]-(s:Skill) RETURN s ORDER BY s.name',
            { categoryName }
        );
        const rawData = extractNodePropsList(result.records, 's');
        return rawData.map(data => toSkillType(data)).filter((skill): skill is SkillType => skill !== null);
    } finally {
        await session.close();
    }
};

/**
 * Fetches distinct Categories of Skills linked *from* a specific Skill.
 */
export const findLinkedFromCategories = async (skillName: string): Promise<CategoryType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
        const result = await session.run(
            `MATCH (s:Skill {name: $skillName})-[:LINKS_TO]->(:Skill)-[:BELONGS_TO]->(c:Category)
             RETURN DISTINCT c ORDER BY c.name`,
            { skillName }
        );
        const rawData = extractNodePropsList(result.records, 'c');
        return rawData.map(data => toCategoryType(data)).filter((cat): cat is CategoryType => cat !== null);
    } finally {
        await session.close();
    }
};

/**
 * Fetches distinct Categories of Skills linked *to* a specific Skill.
 */
export const findLinkedToCategories = async (skillName: string): Promise<CategoryType[]> => {
    const currentDriver = getDriver();
    const session = currentDriver.session();
    try {
        const result = await session.run(
            `MATCH (s:Skill {name: $skillName})<-[:LINKS_TO]-(:Skill)-[:BELONGS_TO]->(c:Category)
             RETURN DISTINCT c ORDER BY c.name`,
            { skillName }
        );
        const rawData = extractNodePropsList(result.records, 'c');
        return rawData.map(data => toCategoryType(data)).filter((cat): cat is CategoryType => cat !== null);
    } finally {
        await session.close();
    }
};
