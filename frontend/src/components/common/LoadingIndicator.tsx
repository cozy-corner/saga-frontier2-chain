import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return <p className="loading-indicator">{message}</p>;
}
