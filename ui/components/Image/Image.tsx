'use client';
import * as React from 'react';
import styles from './Image.module.scss';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio preset */
  aspectRatio?: 'square' | 'video' | 'photo' | 'wide' | 'portrait' | number;
  /** Object fit behavior */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  /** Object position */
  objectPosition?: string;
  /** Loading behavior */
  loading?: 'lazy' | 'eager';
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Border radius variant */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Whether to show a placeholder while loading */
  showPlaceholder?: boolean;
  /** Fallback image source */
  fallbackSrc?: string;
  /** Callback when image fails to load */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Callback when image loads successfully */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ASPECT_RATIOS = {
  square: 1,
  video: 16 / 9,
  photo: 4 / 3,
  wide: 21 / 9,
  portrait: 3 / 4,
} as const;

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      aspectRatio,
      objectFit = 'cover',
      objectPosition = 'center',
      loading = 'lazy',
      size = 'full',
      radius = 'none',
      showPlaceholder = true,
      fallbackSrc,
      onError,
      onLoad,
      className = '',
      style,
      alt,
      src,
      ...rest
    },
    ref
  ) => {
    const [hasError, setHasError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentSrc, setCurrentSrc] = React.useState(src);

    React.useEffect(() => {
      setCurrentSrc(src);
      setHasError(false);
      setIsLoading(true);
    }, [src]);

    const handleError = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setHasError(true);
        setIsLoading(false);

        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          setHasError(false);
          setIsLoading(true);
        }

        onError?.(event);
      },
      [fallbackSrc, currentSrc, onError]
    );

    const handleLoad = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setIsLoading(false);
        setHasError(false);
        onLoad?.(event);
      },
      [onLoad]
    );

    const aspectRatioValue = React.useMemo(() => {
      if (typeof aspectRatio === 'number') return aspectRatio;
      if (aspectRatio && aspectRatio in ASPECT_RATIOS) {
        return ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS];
      }
      return undefined;
    }, [aspectRatio]);

    const customStyle: React.CSSProperties = {
      ...style,
      objectFit,
      objectPosition,
      ...(aspectRatioValue && { aspectRatio: aspectRatioValue.toString() }),
    };

    const containerClasses = [
      styles.container,
      styles[size],
      styles[`radius-${radius}`],
      aspectRatio ? styles.aspectRatio : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const imageClasses = [
      styles.image,
      isLoading ? styles.loading : '',
      hasError ? styles.error : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {showPlaceholder && isLoading && (
          <div className={styles.placeholder} aria-hidden="true">
            <div className={styles.placeholderIcon} />
          </div>
        )}

        {currentSrc && (
          <img
            ref={ref}
            src={currentSrc}
            alt={alt}
            loading={loading}
            className={imageClasses}
            style={customStyle}
            onError={handleError}
            onLoad={handleLoad}
            {...rest}
          />
        )}

        {hasError && !fallbackSrc && (
          <div
            className={styles.errorState}
            role="img"
            aria-label={alt || 'Failed to load image'}
          >
            <div className={styles.errorIcon} />
            <span className={styles.errorText}>Image failed to load</span>
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';
export default Image;
