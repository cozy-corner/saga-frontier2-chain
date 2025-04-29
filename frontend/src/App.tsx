import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

// カテゴリ一覧を取得
const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
    }
  }
`;

// 特定カテゴリの技一覧を取得
const GET_SKILLS_BY_CATEGORY = gql`
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
const GET_SKILL_LINKED_CATEGORIES = gql`
  query GetSkillLinkedCategories($skillName: String!) {
    skill(name: $skillName) {
      name
    }
    linkedFromCategories(skillName: $skillName) {
      name
    }
  }
`;

// カテゴリ一覧コンポーネント
function CategoryList({ onSelectCategory, selectedCategory }: { 
  onSelectCategory: (categoryName: string) => void, 
  selectedCategory: string | null 
}) {
  const { loading, error, data } = useQuery(GET_CATEGORIES);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <ul className="category-list">
      {data.categories.map((category: { name: string }) => (
        <li 
          key={category.name}
          className={selectedCategory === category.name ? 'selected' : ''}
          onClick={() => onSelectCategory(category.name)}
        >
          {category.name}
        </li>
      ))}
    </ul>
  );
}

// 技一覧コンポーネント
function SkillList({ categoryName, onSelectSkill, selectedSkill }: { 
  categoryName: string, 
  onSelectSkill: (skillName: string) => void, 
  selectedSkill: string | null 
}) {
  const { loading, error, data } = useQuery(GET_SKILLS_BY_CATEGORY, {
    variables: { categoryName }
  });
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <ul className="skill-list">
      {data.category.skills.map((skill: { name: string }) => (
        <li 
          key={skill.name}
          className={selectedSkill === skill.name ? 'selected' : ''}
          onClick={() => onSelectSkill(skill.name)}
        >
          {skill.name}
        </li>
      ))}
    </ul>
  );
}

// 連携先カテゴリコンポーネント
function LinkedCategories({ 
  skillName, 
  onSelectCategory 
}: { 
  skillName: string,
  onSelectCategory: (categoryName: string) => void 
}) {
  const { loading, error, data } = useQuery(GET_SKILL_LINKED_CATEGORIES, {
    variables: { skillName }
  });
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <div>
      {data.linkedFromCategories.length === 0 ? (
        <p>連携先カテゴリはありません</p>
      ) : (
        <ul className="linked-categories">
          {data.linkedFromCategories.map((category: { name: string }) => (
            <li 
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className="clickable"
            >
              {category.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // カテゴリ選択時のハンドラー
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSkill(null); // カテゴリが変わったら技の選択をリセット
  };

  // 技選択時のハンドラー
  const handleSkillSelect = (skillName: string) => {
    setSelectedSkill(skillName);
  };

  return (
    <div className="app">
      <h1>SaGa Frontier2 術・技連携ビジュアライザー</h1>
      
      <div className="content">
        <div className="column">
          <h2>カテゴリ一覧</h2>
          <CategoryList 
            onSelectCategory={handleCategorySelect} 
            selectedCategory={selectedCategory} 
          />
        </div>
        
        {selectedCategory && (
          <div className="column">
            <h2>{selectedCategory}の技</h2>
            <SkillList 
              categoryName={selectedCategory} 
              onSelectSkill={handleSkillSelect}
              selectedSkill={selectedSkill}
            />
          </div>
        )}
        
        {selectedSkill && (
          <div className="column">
            <h2>{selectedSkill}の連携先</h2>
            <LinkedCategories 
              skillName={selectedSkill} 
              onSelectCategory={handleCategorySelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
