/** Headless logic hook for Popover */
import * as React from 'react';

export function usePopover() {
  // TODO: implement logic state
  const [state, setState] = React.useState(null);
  return { state, setState };
}
