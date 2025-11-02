import { Metadata } from 'next';
import { MigrationDoc } from '../../_components/MigrationDoc';
import { getMigrationData } from '../../_lib/migrationData';

type Props = {
  params: Promise<{ migration: string }>;
};

export async function generateStaticParams() {
  // For now, return example migration
  // In the future, this could scan for all migration files
  return [{ migration: 'button-v1-v2' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { migration } = await params;
  const migrationData = getMigrationData('Button');

  if (!migrationData) {
    return {
      title: 'Migration Not Found',
    };
  }

  return {
    title: `${migrationData.componentName} Migration Guide: ${migrationData.fromVersion} → ${migrationData.toVersion}`,
    description: `Migration guide for ${migrationData.componentName} component from version ${migrationData.fromVersion} to ${migrationData.toVersion}.`,
    openGraph: {
      title: `${migrationData.componentName} Migration Guide`,
      description: `Migrate ${migrationData.componentName} from ${migrationData.fromVersion} to ${migrationData.toVersion}`,
      type: 'article',
    },
  };
}

export default async function MigrationPage({ params }: Props) {
  const { migration } = await params;

  // For now, use Button migration as example
  // In the future, this could parse the migration slug to get component name
  const migrationData = getMigrationData('Button');

  if (!migrationData) {
    return <div>Migration not found</div>;
  }

  return <MigrationDoc migration={migrationData} />;
}
