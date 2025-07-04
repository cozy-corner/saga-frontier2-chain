import { gql } from 'apollo-server';
// Import repository functions instead of neo4j driver directly
import {
  findAllCategories,
  findCategoryByName,
  findSkills,
  findSkillByName,
  findCategoryForSkill,
  findSkillsLinkedFrom,
  findSkillsLinkedTo,
  findSkillsForCategory,
  findLinkedFromCategories,
  findLinkedToCategories
} from './infrastructure/neo4jRepository';

export const typeDefs = gql`
  type Category {
    name: String!
    skills: [Skill!]! # Skills belonging to this category
    order: Int!
  }

  type Skill {
    name: String!
    category: Category # Category this skill belongs to (optional as query might not fetch it)
    linksTo: [Skill!]! # Skills this skill can link to
    linkedBy: [Skill!]! # Skills that can link to this skill
    nonFinalName: String # Name used at beginning/middle of chain
    finalName: String # Name used at end of chain
    # linkedCategories: [Category!]! # Categories of skills this skill can link to (distinct) - Derived via query
  }

  type Query {
    # Get all categories
    categories: [Category!]!
    # Get a specific category by name
    category(name: String!): Category
    # Get skills, optionally filtered by category name
    skills(categoryName: String): [Skill!]!
    # Get a specific skill by name, including linkage info
    skill(name: String!): Skill
    # Get distinct categories of skills linked *from* a specific skill
    linkedFromCategories(skillName: String!): [Category!]!
    # Get distinct categories of skills linked *to* a specific skill
    linkedToCategories(skillName: String!): [Category!]!
    # Get all skills linked from a specific skill (without category filtering)
    linkedSkills(skillName: String!): [Skill!]!
  }
`;

export const resolvers = {
  Query: {
    // Use repository functions for data fetching
    categories: async () => findAllCategories(),
    category: async (_: unknown, { name }: { name: string }) => findCategoryByName(name),
    skills: async (_: unknown, { categoryName }: { categoryName?: string }) => findSkills(categoryName),
    skill: async (_: unknown, { name }: { name: string }) => findSkillByName(name),
    linkedFromCategories: async (_: unknown, { skillName }: { skillName: string }) => findLinkedFromCategories(skillName),
    linkedToCategories: async (_: unknown, { skillName }: { skillName: string }) => findLinkedToCategories(skillName),
    linkedSkills: async (_: unknown, { skillName }: { skillName: string }) => {
      const skill = await findSkillByName(skillName);
      if (!skill) return [];
      return findSkillsLinkedFrom(skillName);
    },
  },
  // Resolvers for nested fields within Types, calling repository functions
  Skill: {
    category: async (parent: { name: string }) => findCategoryForSkill(parent.name),
    linksTo: async (parent: { name: string }) => findSkillsLinkedFrom(parent.name),
    linkedBy: async (parent: { name: string }) => findSkillsLinkedTo(parent.name),
  },
  Category: {
      skills: async (parent: { name: string }) => findSkillsForCategory(parent.name),
  }
};
