import { useInspector } from './FontInspector';
import styles from './FontInspector.module.scss';
/*
  AnatomyControls
  Now displays information about hover-based feature discovery
  Features are discovered via hover zones on the glyph canvas
*/
export const AnatomyControls: React.FC = () => {
  const { showDetails, setShowDetails } = useInspector();

  return (
    <div className={styles.anatomyControls}>
      <h4>Anatomy Details</h4>
      <div>
        <ul>
          <li>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <input
                type="checkbox"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Show Details</span>
            </label>
          </li>
        </ul>
        <div
          style={{
            marginTop: 'var(--core-spacing-size-06)',
            padding: 'var(--core-spacing-size-04)',
            background: 'var(--semantic-color-background-secondary)',
            borderRadius: 'var(--core-shape-radius-small)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--semantic-typography-body-02-fontSize)',
              color: 'var(--semantic-color-foreground-secondary)',
            }}
          >
            💡 <strong>Hover over the glyph</strong> to discover typographic
            features. Press <kbd>Tab</kbd> to navigate between features with
            your keyboard.
          </p>
        </div>
      </div>
    </div>
  );
};
