import { gql } from 'apollo-server';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://localhost:7687');

export const typeDefs = gql`
  type Skill {
    name: String!
  }

  type Query {
    skills: [Skill!]!
  }
`;

export const resolvers = {
  Query: {
    skills: async () => {
      const session = driver.session();
      const result = await session.run('MATCH (s:Skill) RETURN s.name AS name');
      await session.close();
      return result.records.map(record => ({
        name: record.get('name')
      }));
    }
  }
};
