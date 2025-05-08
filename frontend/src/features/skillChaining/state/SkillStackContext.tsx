import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface SkillStackState {
  selectedSkills: string[]; // スキル名の配列
}

type SkillStackAction =
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'CLEAR_SKILLS' }
  | { type: 'SELECT_STACK_SKILL'; payload: number }; // スタック内のスキルを選択したときのインデックス

const MAX_SKILLS = 4;
const initialState: SkillStackState = {
  selectedSkills: []
};

export function skillStackReducer(state: SkillStackState, action: SkillStackAction): SkillStackState {
  switch (action.type) {
    case 'ADD_SKILL': {
      if (!action.payload.trim()) {
        console.warn('Attempted to add an empty skill name');
        return state;
      }
      
      // 新しいスキルを追加、最大数を超える場合は古いスキルを削除
      const newSkills = [...state.selectedSkills, action.payload];
      return {
        ...state,
        selectedSkills: newSkills.slice(-MAX_SKILLS) // 最新の MAX_SKILLS 個だけを保持
      };
    }
    
    case 'REMOVE_SKILL': {
      // 空のスキル名のバリデーション
      if (!action.payload.trim()) {
        console.warn('Attempted to remove an empty skill name');
        return state;
      }
      
      return {
        ...state,
        selectedSkills: state.selectedSkills.filter(skill => skill !== action.payload)
      };
    }
    
    case 'CLEAR_SKILLS': {
      return initialState;
    }
    
    case 'SELECT_STACK_SKILL': {
      // インデックスの範囲チェック
      if (action.payload < 0 || action.payload >= state.selectedSkills.length) {
        console.warn(`Invalid index: ${action.payload}. Stack size: ${state.selectedSkills.length}`);
        return state;
      }
      
      // スタック内の指定されたインデックスまでのスキルのみを保持
      return {
        ...state,
        selectedSkills: state.selectedSkills.slice(0, action.payload + 1)
      };
    }
    
    default:
      return state;
  }
}

interface SkillStackContextType {
  state: SkillStackState;
  dispatch: React.Dispatch<SkillStackAction>;
}

const SkillStackContext = createContext<SkillStackContextType | undefined>(undefined);

export function SkillStackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(skillStackReducer, initialState);

  return (
    <SkillStackContext.Provider value={{ state, dispatch }}>
      {children}
    </SkillStackContext.Provider>
  );
}

export function useSkillStack() {
  const context = useContext(SkillStackContext);
  if (context === undefined) {
    throw new Error('useSkillStack must be used within a SkillStackProvider');
  }
  return context;
}
