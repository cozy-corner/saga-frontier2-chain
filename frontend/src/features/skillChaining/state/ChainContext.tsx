import React, { createContext, useContext, useReducer } from 'react';
import { 
  ChainState, 
  ChainAction, 
  ChainContextType, 
  ProviderProps 
} from '@features/skillChaining/types';

// Initial state
const initialState: ChainState = {
  selectedCategory: null,
  selectedSkill: null,
  sourceSkill: null,
  isLinkMode: false
};

// Reducer function
function chainReducer(state: ChainState, action: ChainAction): ChainState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      if (action.payload.fromLink && state.selectedSkill) {
        // When selecting a category from linked categories
        return {
          ...state,
          selectedCategory: action.payload.name,
          sourceSkill: state.selectedSkill,
          selectedSkill: null,
          isLinkMode: true
        };
      } else {
        // Normal category selection
        return {
          ...state,
          selectedCategory: action.payload.name,
          selectedSkill: null,
          sourceSkill: null,
          isLinkMode: false
        };
      }
    
    case 'SELECT_SKILL':
      return {
        ...state,
        selectedSkill: action.payload.name
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}


// Create context
const ChainContext = createContext<ChainContextType | undefined>(undefined);

export function ChainProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(chainReducer, initialState);

  return (
    <ChainContext.Provider value={{ state, dispatch }}>
      {children}
    </ChainContext.Provider>
  );
}

// Hook for using the context
export function useChain() {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
}
