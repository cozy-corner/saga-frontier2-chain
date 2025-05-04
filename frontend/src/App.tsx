import React, { useState } from 'react';
import { MainLayout } from '@layouts/MainLayout';
import { CategoryList } from '@features/categories/CategoryList';
import { SkillList } from '@features/skills/SkillList';
import { LinkedCategories } from '@features/skillChaining/components/filters/LinkedCategories';
import { SkillChainVisualization } from '@features/skillChaining/pages/SkillChainVisualization';
import { ChainProvider, useChain } from '@features/skillChaining/context/ChainContext';
import { GraphProvider } from '@features/skillChaining/context/GraphVisualizationContext';

function ChainViewer() {
  const { state, dispatch } = useChain();
  const { selectedCategory, selectedSkill, sourceSkill, isLinkMode } = state;

  // カテゴリ選択時のハンドラー
  const handleCategorySelect = (categoryName: string, fromLink = false) => {
    dispatch({ 
      type: 'SELECT_CATEGORY', 
      payload: { name: categoryName, fromLink }
    });
  };

  // 技選択時のハンドラー
  const handleSkillSelect = (skillName: string) => {
    dispatch({ 
      type: 'SELECT_SKILL', 
      payload: { name: skillName }
    });
  };

  return (
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
  );
}

function App() {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  
  // 表示モード切り替えボタンのスタイル
  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 5px 15px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };
  
  const activeStyle = {
    ...buttonStyle,
    background: '#f6ab6c',
    color: 'white',
  };
  
  const inactiveStyle = {
    ...buttonStyle,
    background: '#f0f0f0',
    color: '#666',
  };

  return (
    <ChainProvider>
      <MainLayout>
        <h1>SaGa Frontier2 連携ビジュアライザー</h1>
        <div className="view-toggle">
          <button 
            style={viewMode === 'list' ? activeStyle : inactiveStyle}
            onClick={() => setViewMode('list')}
          >
            リスト表示
          </button>
          <button 
            style={viewMode === 'graph' ? activeStyle : inactiveStyle}
            onClick={() => setViewMode('graph')}
          >
            グラフ表示
          </button>
        </div>
        
        {viewMode === 'list' ? (
          <ChainViewer />
        ) : (
          <GraphProvider>
            <SkillChainVisualization />
          </GraphProvider>
        )}
      </MainLayout>
    </ChainProvider>
  );
}

// スタイル用のCSSを追加します
const styles = `
.view-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.content {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1;
  min-width: 250px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
}
`;

// スタイルを適用
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default App;
