import React, { createContext, useContext, useState, ReactNode } from 'react';

// Graph-specific state
interface GraphState {
  graphSkill: string | null;
}

// Context type definition
interface GraphContextType {
  state: GraphState;
  setGraphSkill: (skillName: string | null) => void;
}

// Create context
const GraphContext = createContext<GraphContextType | undefined>(undefined);

// Provider component
interface GraphProviderProps {
  children: ReactNode;
}

export function GraphProvider({ children }: GraphProviderProps) {
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
