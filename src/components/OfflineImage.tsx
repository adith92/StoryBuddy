import React from 'react';
import { useOfflineImage } from '../lib/offline';

export const OfflineImage: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt, className }) => {
  const offlineSrc = useOfflineImage(src);
  return <img src={offlineSrc} alt={alt} className={className} />;
};
