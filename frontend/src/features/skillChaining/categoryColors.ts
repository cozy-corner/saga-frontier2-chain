// カテゴリーごとの色を定義
export const categoryColors: Record<string, { bg: string, border: string }> = {
  default: { bg: '#f6ab6c', border: '#c56c1d' },
  '基本術': { bg: '#d4f1f9', border: '#75c6ef' },
  '合成術': { bg: '#e6f9d4', border: '#6def75' },
  '剣': { bg: '#ffe5e5', border: '#ff9e9e' },
  '槍': { bg: '#e5e5ff', border: '#9e9eff' },
  '斧': { bg: '#ffe5ff', border: '#ff9eff' },
  '弓': { bg: '#ffffe5', border: '#ffff9e' },
  '体': { bg: '#f2e6ff', border: '#bf80ff' },
  '固有技': { bg: '#ffe6cc', border: '#ffaa80' },
  '固有術': { bg: '#e6ffe6', border: '#80ff80' },
  '杖': { bg: '#ffe6f2', border: '#ff80bf' },
  '敵': { bg: '#f2f2f2', border: '#808080' },
};

// カテゴリ名に基づいて最適な色を見つける
export function getCategoryColor(categoryName: string): { bg: string, border: string } {
  const exactMatch = categoryColors[categoryName];
  if (exactMatch) {
    return exactMatch;
  }
  
  // 部分一致を探す（「剣技」→「剣」など）
  const partialMatch = Object.keys(categoryColors).find(key => 
    categoryName.toLowerCase().includes(key.toLowerCase())
  );
  
  return partialMatch ? categoryColors[partialMatch] : categoryColors.default;
}
