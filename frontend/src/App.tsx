import { MainLayout } from '@layouts/MainLayout';
import { SkillChainVisualization } from '@features/skillChaining/pages/SkillChainVisualization';
import { ChainProvider } from '@features/skillChaining/context/ChainContext';
import { GraphProvider } from '@features/skillChaining/context/GraphVisualizationContext';
import { SkillStackProvider } from '@features/skillChaining/context/SkillStackContext';

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

// スタイル用のCSSを追加します
const styles = `
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
