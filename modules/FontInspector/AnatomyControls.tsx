import ToggleSwitch from '../../components/ToggleSwitch';
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
            <ToggleSwitch
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
            >
              Show Details
            </ToggleSwitch>
          </li>
        </ul>
        <ul>
          {anatomyFeatures.map((feature) => (
            <li key={feature.feature}>
              <ToggleSwitch
                checked={selectedAnatomy.has(feature.feature)}
                onChange={() => toggleAnatomy(feature)}
                disabled={feature.disabled}
              >
                {feature.label}
              </ToggleSwitch>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
