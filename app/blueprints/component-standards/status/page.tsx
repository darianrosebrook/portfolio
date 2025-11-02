import { StatusMatrix } from '../_components/StatusMatrix';
import { getAllComponents } from '../_lib/componentsData';

export default async function StatusPage() {
  const components = getAllComponents();
  return <StatusMatrix components={components} />;
}
