/** Headless logic hook for Select */
import * as React from 'react';

export function useSelect() {
  // TODO: implement logic state
  const [state, setState] = React.useState(null);
  return { state, setState };
}
