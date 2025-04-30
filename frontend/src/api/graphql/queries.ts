import { gql } from '@apollo/client';

// カテゴリ一覧を取得
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
    }
  }
`;

// 特定カテゴリの技一覧を取得
export const GET_SKILLS_BY_CATEGORY = gql`
  query GetSkillsByCategory($categoryName: String!) {
    category(name: $categoryName) {
      name
      skills {
        name
      }
    }
  }
`;

// 選択した技の連携先カテゴリを取得
export const GET_SKILL_LINKED_CATEGORIES = gql`
  query GetSkillLinkedCategories($skillName: String!) {
    skill(name: $skillName) {
      name
    }
    linkedFromCategories(skillName: $skillName) {
      name
    }
  }
`;

// 選択した技から連携可能な技を取得
export const GET_LINKED_SKILLS = gql`
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
