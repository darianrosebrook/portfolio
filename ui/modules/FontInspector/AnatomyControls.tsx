import { SwitchField } from '../../components/Switch';
import { useInspector } from './FontInspector';
import { toFeatureID } from '@/utils/typeAnatomy/types';
import styles from './FontInspector.module.scss';
/*
  AnatomyControls
  allows for a user to toggle the anatomy features based on features created in the InspectorProvider
  Filters features based on current glyph availability
*/
export const AnatomyControls: React.FC = () => {
  const {
    anatomyFeatures,
    selectedAnatomy,
    toggleAnatomy,
    showDetails,
    setShowDetails,
    availableFeatureIds,
  } = useInspector();

  // Metric features are always available (Baseline, Cap height, etc.)
  const metricFeatures = new Set([
    'Baseline',
    'Cap height',
    'X-height',
    'Ascender',
    'Descender',
  ]);

  // Filter anatomy features to only show those available for current glyph
  const filteredFeatures = anatomyFeatures.filter((feature) => {
    // Metric features are always available
    if (metricFeatures.has(feature.feature)) {
      return true;
    }
    // For other features, check if they're in availableFeatureIds
    const featureId = toFeatureID(feature.feature);
    return featureId ? availableFeatureIds.includes(featureId) : false;
  });

  return (
    <div className={styles.anatomyControls}>
      <h4>Anatomy Details</h4>
      <div>
        <ul>
          <li>
            <SwitchField
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
              label="Show Details"
            />
          </li>
        </ul>
        <ul>
          {filteredFeatures.map((feature) => (
            <li key={feature.feature}>
              <SwitchField
                checked={selectedAnatomy.has(feature.feature)}
                onChange={() => toggleAnatomy(feature)}
                disabled={feature.disabled}
                label={feature.label}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
