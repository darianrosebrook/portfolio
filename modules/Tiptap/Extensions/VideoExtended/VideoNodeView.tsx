import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import styles from './VideoNodeView.module.scss';

interface VideoNodeViewProps extends NodeViewProps {
  // Additional props can be added here
}

/**
 * Video Node View Component
 * Renders video elements with controls and responsive behavior
 */
const VideoNodeView: React.FC<VideoNodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    src,
    alt,
    title,
    width,
    height,
    controls,
    autoplay,
    loop,
    muted,
    poster,
    'data-align': align,
  } = node.attrs;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load video');
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  const handleAlignChange = (newAlign: string) => {
    updateAttributes({ 'data-align': newAlign });
  };

  if (!src) {
    return (
      <NodeViewWrapper className={`${styles.videoWrapper} ${styles.empty}`}>
        <div className={styles.placeholder}>
          <div className={styles.icon}>🎥</div>
          <p>No video source provided</p>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      className={`${styles.videoWrapper} ${selected ? styles.selected : ''}`}
      data-align={align}
    >
      {selected && (
        <div className={styles.toolbar}>
          <button
            onClick={() => handleAlignChange('left')}
            className={align === 'left' ? styles.active : ''}
            title="Align left"
          >
            ←
          </button>
          <button
            onClick={() => handleAlignChange('center')}
            className={align === 'center' ? styles.active : ''}
            title="Align center"
          >
            ↔
          </button>
          <button
            onClick={() => handleAlignChange('right')}
            className={align === 'right' ? styles.active : ''}
            title="Align right"
          >
            →
          </button>
        </div>
      )}

      <div className={styles.videoContainer}>
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading video...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <div className={styles.icon}>⚠️</div>
            <p>{error}</p>
            <small>{src}</small>
          </div>
        )}

        <video
          ref={videoRef}
          src={src}
          title={title}
          width={width}
          height={height}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          poster={poster}
          className={styles.video}
          preload="metadata"
          onError={() => setError('Failed to load video')}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        />
      </div>

      {title && <div className={styles.caption}>{title}</div>}
    </NodeViewWrapper>
  );
};

export default VideoNodeView;
