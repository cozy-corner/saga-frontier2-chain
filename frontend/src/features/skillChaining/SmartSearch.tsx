import React, { useState, useEffect, useRef } from 'react';

interface SkillSuggestion {
  name: string;
  category?: string;
}

interface SmartSearchProps {
  onSelectSkill: (skillName: string) => void;
  allSkills: SkillSuggestion[];
  loading?: boolean;
}

export function SmartSearch({ onSelectSkill, allSkills, loading = false }: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 検索語句の変更を監視して、サジェスチョンを更新
  useEffect(() => {
    // 検索語が空の場合は何も表示しない
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    console.log('検索フィルタリング実行:', searchTerm);
    
    const filteredSuggestions = allSkills.filter(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('フィルタリング結果:', filteredSuggestions);
    
    setSuggestions(filteredSuggestions.slice(0, 10)); // 最大10件表示
    setIsOpen(filteredSuggestions.length > 0);
  }, [searchTerm, allSkills]);

  // クリックイベントのハンドリング（検索ボックス外をクリックしたら閉じる）
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 検索語句の変更ハンドラ
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // 1文字でも入力があればサジェストを表示できるようにする
    if (e.target.value.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    
    // デバッグ出力
    console.log('検索語:', e.target.value);
    console.log('スキル一覧:', allSkills);
  };

  // サジェスチョン選択ハンドラ
  const handleSelectSuggestion = (skillName: string) => {
    onSelectSkill(skillName);
    setSearchTerm('');
    setIsOpen(false);
  };

  // キーボードイベントハンドラ（↑↓キーでの移動と Enter での選択）
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    // 上キー
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }
    // 下キー
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    }
    // Enterキー
    else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex].name);
    }
    // Escキー
    else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="smart-search" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="スキル名を検索..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            console.log('フォーカス時: スキル数', allSkills.length);
            // 入力がある場合はすぐにサジェスチョンを表示
            if (searchTerm.length > 0) {
              setIsOpen(true);
            }
          }}
          disabled={loading}
        />
        {loading && <div className="search-loading-indicator">検索中...</div>}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((skill, index) => (
            <li 
              key={skill.name}
              className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleSelectSuggestion(skill.name)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="skill-name">{skill.name}</span>
              {skill.category && (
                <span className="skill-category">{skill.category}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && searchTerm.length > 0 && suggestions.length === 0 && (
        <div className="no-suggestions">
          「{searchTerm}」に一致するスキルはありません
        </div>
      )}

      <style>{`
        .smart-search {
          position: relative;
          width: 100%;
        }
        
        .search-input-container {
          position: relative;
        }
        
        .search-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .search-input:focus {
          border-color: #f6ab6c;
          box-shadow: 0 0 0 2px rgba(246, 171, 108, 0.2);
        }
        
        .search-loading-indicator {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #888;
        }
        
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: 300px;
          overflow-y: auto;
          background: white;
          border: 1px solid #ddd;
          border-radius: 0 0 4px 4px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .suggestion-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }
        
        .suggestion-item:hover,
        .suggestion-item.active {
          background: #f5f5f5;
        }
        
        .skill-name {
          font-weight: 500;
        }
        
        .skill-category {
          font-size: 12px;
          color: #777;
          background: #eee;
          padding: 2px 6px;
          border-radius: 10px;
        }
        
        .no-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          padding: 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 0 0 4px 4px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          color: #888;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
