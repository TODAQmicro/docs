export const whenMounted = (fn: () => void) => {
  let mounted = true;

  if (mounted) fn();

  return () => { mounted = false; };
};
