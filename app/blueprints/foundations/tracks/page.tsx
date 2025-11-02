import Link from 'next/link';
import { getAllTracks } from '../_lib/tracks';
import styles from './tracks.module.scss';

export default function TracksPage() {
  const tracks = getAllTracks();

  return (
    <div className={styles.tracksPage}>
      <header className={styles.header}>
        <h1>Learning Tracks</h1>
        <p className={styles.description}>
          Choose a learning track tailored to your role. Each track provides a
          curated sequence through foundation concepts, highlighting the most
          relevant sections for your work.
        </p>
      </header>

      <div className={styles.tracksGrid}>
        {tracks.map((track) => (
          <Link
            key={track.id}
            href={`/blueprints/foundations/tracks/${track.id}`}
            className={styles.trackCard}
          >
            <div
              className={styles.trackHeader}
              style={{ '--track-color': track.color } as React.CSSProperties}
            >
              <h2 className={styles.trackTitle}>{track.name}</h2>
              <div
                className={styles.trackIndicator}
                style={{ backgroundColor: track.color }}
              />
            </div>
            <p className={styles.trackDescription}>{track.description}</p>

            <div className={styles.trackDetails}>
              <div className={styles.trackInfo}>
                <span className={styles.trackLabel}>Focus Areas:</span>
                <ul className={styles.trackList}>
                  {track.focusAreas.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.trackInfo}>
                <span className={styles.trackLabel}>Outcomes:</span>
                <ul className={styles.trackList}>
                  {track.outcomes.map((outcome, idx) => (
                    <li key={idx}>{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.trackFooter}>
              <span className={styles.trackLink}>Start {track.name} →</span>
            </div>
          </Link>
        ))}
      </div>

      <section className={styles.howItWorks}>
        <h2>How Learning Tracks Work</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <h3>1. Choose Your Track</h3>
            <p>
              Select the track that matches your role: Designer, Developer, or
              Cross-Functional.
            </p>
          </div>
          <div className={styles.step}>
            <h3>2. Follow the Path</h3>
            <p>
              Each track provides a curated sequence through foundation concepts
              in the order most relevant to your work.
            </p>
          </div>
          <div className={styles.step}>
            <h3>3. See Relevant Sections</h3>
            <p>
              Content is filtered and highlighted based on your track, making it
              easier to focus on what matters most.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
