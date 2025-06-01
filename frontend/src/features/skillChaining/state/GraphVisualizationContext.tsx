import React, { createContext, useContext, useState } from 'react';
import { 
  GraphContextType, 
  ProviderProps 
} from '@features/skillChaining/types';

// Create context
const GraphContext = createContext<GraphContextType | undefined>(undefined);

export function GraphProvider({ children }: ProviderProps) {
  const [graphSkill, setGraphSkill] = useState<string | null>(null);

  return (
    <GraphContext.Provider 
      value={{ 
        state: { graphSkill }, 
        setGraphSkill 
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}

// Hook for using the context
export function useGraphVisualization() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraphVisualization must be used within a GraphProvider');
  }
  return context;
}
