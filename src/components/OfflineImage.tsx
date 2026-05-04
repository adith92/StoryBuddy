import React from 'react';
import { useOfflineImage } from '../lib/offline';

export const OfflineImage: React.FC<{ cacheKey: string; prompt?: string; alt?: string; className?: string }> = ({ cacheKey, prompt, alt, className }) => {
  const offlineSrc = useOfflineImage(cacheKey, prompt);
  return offlineSrc ? <img src={offlineSrc} alt={alt} className={className} /> : <div className={`bg-slate-100 animate-pulse ${className}`} />;
};
