import React from 'react';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { LoadingIndicator } from '@components/common/LoadingIndicator';

interface SkillChainLoadingErrorProps {
  isLoading: boolean;
  errorMessage?: string;
}

/**
 * スキルチェーン画面のローディングとエラー状態を表示するコンポーネント
 */
export function SkillChainLoadingError({ isLoading, errorMessage }: SkillChainLoadingErrorProps) {
  // エラーがある場合
  if (errorMessage) {
    return (
      <div className="error-container">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }
  
  // ローディング中の場合
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingIndicator />
      </div>
    );
  }
  
  return null;
}