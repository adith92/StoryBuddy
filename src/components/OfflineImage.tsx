import React from 'react';
import { useOfflineImage } from '../lib/offline';

export const OfflineImage: React.FC<{ cacheKey: string; prompt?: string; seed?: string; alt?: string; className?: string }> = ({ cacheKey, prompt, seed, alt, className }) => {
  const offlineSrc = useOfflineImage(cacheKey, prompt, seed);
  return offlineSrc ? <img src={offlineSrc} alt={alt} className={className} /> : <div className={`bg-slate-100 animate-pulse ${className}`} />;
};
