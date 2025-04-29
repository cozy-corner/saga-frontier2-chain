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

// 選択した技から連携可能な技を取得
const GET_LINKED_SKILLS = gql`
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
function SkillList({ 
  categoryName, 
  onSelectSkill, 
  selectedSkill,
  sourceSkill,  // 連携元の技（連携モード時に使用）
  isLinkMode    // 連携モードかどうか
}: { 
  categoryName: string, 
  onSelectSkill: (skillName: string) => void, 
  selectedSkill: string | null,
  sourceSkill?: string | null,
  isLinkMode?: boolean
}) {
  // 通常モードの場合は既存のクエリを使用
  const categoryQuery = useQuery(GET_SKILLS_BY_CATEGORY, {
    variables: { categoryName },
    skip: isLinkMode
  });
  
  // 連携モードの場合は連携先技クエリを使用
  const linkQuery = useQuery(GET_LINKED_SKILLS, {
    variables: { 
      skillName: sourceSkill || '', 
      categoryName 
    },
    skip: !isLinkMode || !sourceSkill
  });
  
  if (isLinkMode && sourceSkill) {
    // 連携モードでの表示処理
    if (linkQuery.loading) return <p>Loading...</p>;
    if (linkQuery.error) return <p>Error: {linkQuery.error.message}</p>;

    // sourceSkillから連携するスキルのうち、選択されたカテゴリに属するものをフィルタリング
    const linkedSkills = linkQuery.data?.skill?.linksTo.filter(
      (skill: { category: { name: string } }) => 
        skill.category.name === categoryName
    ) || [];
    
    if (linkedSkills.length === 0) {
      return <p>このカテゴリに連携する技はありません</p>;
    }
    
    return (
      <ul className="skill-list">
        {linkedSkills.map((skill: { name: string }) => (
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
  } else {
    // 通常モードの表示処理
    if (categoryQuery.loading) return <p>Loading...</p>;
    if (categoryQuery.error) return <p>Error: {categoryQuery.error.message}</p>;
    
    return (
      <ul className="skill-list">
        {categoryQuery.data.category.skills.map((skill: { name: string }) => (
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
}

// 連携先カテゴリコンポーネント
function LinkedCategories({ 
  skillName, 
  onSelectCategory 
}: { 
  skillName: string,
  onSelectCategory: (categoryName: string, fromLink?: boolean) => void 
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
              onClick={() => onSelectCategory(category.name, true)}
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
  const [sourceSkill, setSourceSkill] = useState<string | null>(null);
  const [isLinkMode, setIsLinkMode] = useState<boolean>(false);

  // カテゴリ選択時のハンドラー
  const handleCategorySelect = (categoryName: string, fromLink = false) => {
    setSelectedCategory(categoryName);
    setSelectedSkill(null); // カテゴリが変わったら技の選択をリセット
    
    if (fromLink && selectedSkill) {
      // 連携先カテゴリから選択時
      setSourceSkill(selectedSkill);
      setIsLinkMode(true);
    } else {
      // 通常のカテゴリリストから選択時
      setIsLinkMode(false);
      setSourceSkill(null);
    }
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
            <h2>
              {isLinkMode && sourceSkill 
                ? `${sourceSkill}から連携可能な${selectedCategory}の技` 
                : `${selectedCategory}の技`}
            </h2>
            <SkillList 
              categoryName={selectedCategory} 
              onSelectSkill={handleSkillSelect}
              selectedSkill={selectedSkill}
              sourceSkill={sourceSkill}
              isLinkMode={isLinkMode}
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
