import { SwitchField } from '../../components/Switch';
import { useInspector } from './FontInspector';
import styles from './FontInspector.module.scss';
/*
  AnatomyControls
  allows for a user to toggle the anatomy features based on features created in the InspectorProvider
*/
export const AnatomyControls: React.FC = () => {
  const {
    anatomyFeatures,
    selectedAnatomy,
    toggleAnatomy,
    showDetails,
    setShowDetails,
  } = useInspector();

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
          {anatomyFeatures.map((feature) => (
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
