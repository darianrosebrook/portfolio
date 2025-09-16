/** Headless logic hook for SideNavigation */
import * as React from 'react';

export function useSideNavigation() {
  // TODO: implement logic state
  const [state, setState] = React.useState(null);
  return { state, setState };
}
