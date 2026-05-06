import React from 'react';
import { useOfflineImage } from '../lib/offline';

export const OfflineImage: React.FC<{ cacheKey: string; prompt?: string; seed?: string; alt?: string; className?: string }> = ({ cacheKey, prompt, seed, alt, className }) => {
  const [hasError, setHasError] = React.useState(false);
  const offlineSrc = useOfflineImage(cacheKey, prompt, seed);
  
  if (hasError || !offlineSrc) {
    return <div className={`bg-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-400 ${className}`}><span className="text-xs">{offlineSrc ? 'Image Load Error' : 'Generating...'}</span></div>;
  }

  return <img src={offlineSrc} alt={alt} className={className} onError={(e) => {
    console.error("Image failed to load:", offlineSrc?.slice(0, 100));
    setHasError(true);
  }} />;
};
