import { useEffect, useState } from 'react';
import { getDossiers } from '../services/dossierService';

export function useActiveDossierCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDossiers()
      .then((dossiers) => {
        if (isMounted) setCount(dossiers.filter((dossier) => dossier.status === 'open').length);
      })
      .catch(() => {
        if (isMounted) setCount(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return count;
}
