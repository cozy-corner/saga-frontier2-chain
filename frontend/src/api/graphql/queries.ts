import { gql } from '@apollo/client';

// カテゴリ一覧を取得
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
      order
    }
  }
`;

// 特定カテゴリの技一覧を取得
export const GET_SKILLS_BY_CATEGORY = gql`
  query GetSkillsByCategory($categoryName: String!) {
    category(name: $categoryName) {
      name
      order
      skills {
        name
        nonFinalName
        finalName
      }
    }
  }
`;

// 選択した技の連携先カテゴリを取得
export const GET_SKILL_LINKED_CATEGORIES = gql`
  query GetSkillLinkedCategories($skillName: String!) {
    skill(name: $skillName) {
      name
      nonFinalName
      finalName
    }
    linkedFromCategories(skillName: $skillName) {
      name
      order
    }
  }
`;

// カテゴリ指定で選択した技から連携可能な技を取得
export const GET_LINKED_SKILLS_BY_CATEGORY = gql`
  query GetLinkedSkillsByCategory($skillName: String!, $categoryName: String!) {
    skill(name: $skillName) {
      name
      nonFinalName
      finalName
      linksTo {
        name
        nonFinalName
        finalName
        category {
          name
          order
        }
        linksTo {
          name
          nonFinalName
          finalName
        }
      }
    }
    category(name: $categoryName) {
      name
      order
    }
  }
`;

// カテゴリ指定なしで選択した技から連携可能な技を取得
export const GET_LINKED_SKILLS = gql`
  query GetLinkedSkills($skillName: String!) {
    linkedSkills(skillName: $skillName) {
      name
      nonFinalName
      finalName
      category {
        name
        order
      }
      linksTo {
        name
        nonFinalName
        finalName
      }
    }
  }
`;
