import { useEffect, useState } from 'react';

export function useAsyncData(loader, deps = []) {
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function runLoader() {
      await Promise.resolve();
      if (!active) return;
      setState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const data = await loader();
        if (active) setState({ loading: false, error: '', data });
      } catch (error) {
        if (active) setState({ loading: false, error: error.message || 'Unable to load data.', data: null });
      }
    }

    runLoader();

    return () => {
      active = false;
    };
    // Data loaders are intentionally keyed by explicit page dependencies and reloadKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return {
    ...state,
    reload: () => setReloadKey((value) => value + 1),
  };
}
