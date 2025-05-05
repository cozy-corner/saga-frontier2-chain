import { MainLayout } from '@layouts/MainLayout';
import { SkillChainVisualization } from '@features/skillChaining/pages/SkillChainVisualization';
import { GraphProvider } from '@features/skillChaining/state/GraphVisualizationContext';
import { SkillStackProvider } from '@features/skillChaining/state/SkillStackContext';

import { ChainProvider } from '@features/skillChaining/state/ChainContext';

function App() {
  return (
    <ChainProvider>
      <MainLayout>
        <h1>SaGa Frontier2 連携ビジュアライザー</h1>
        <GraphProvider>
          <SkillStackProvider>
            <SkillChainVisualization />
          </SkillStackProvider>
        </GraphProvider>
      </MainLayout>
    </ChainProvider>
  );
}


export default App;
