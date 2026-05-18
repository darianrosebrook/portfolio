'use client';
import * as React from 'react';
import './Card.css';

export type CardStatus =
  | 'completed'
  | 'in-progress'
  | 'planned'
  | 'deprecated'
  | 'category'
  | 'complexity';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover affordances (shadow lift, translate) */
  interactive?: boolean;
}

export interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: CardStatus;
}

export interface CardLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'className'
> {
  className?: string;
}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', interactive = false, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        data-ds-component="Card"
        className={[interactive ? 'interactive' : '', className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
CardRoot.displayName = 'Card';

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    data-slot="card-header"
    className={['header', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);
CardHeader.displayName = 'Card.Header';

const CardBadge = React.forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ className = '', status, children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="card-badge"
        className={[
          'badge',
          status ? status.replace(/\s+/g, '-') : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </span>
    );
  }
);
CardBadge.displayName = 'Card.Badge';

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    data-slot="card-content"
    className={['content', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);
CardContent.displayName = 'Card.Content';

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <h3
    data-slot="card-title"
    className={['title', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </h3>
);
CardTitle.displayName = 'Card.Title';

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <p
    data-slot="card-description"
    className={['description', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </p>
);
CardDescription.displayName = 'Card.Description';

const CardMedia: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    data-slot="card-media"
    className={['media', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);
CardMedia.displayName = 'Card.Media';

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    data-slot="card-footer"
    className={['footer', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);
CardFooter.displayName = 'Card.Footer';

const CardActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    data-slot="card-actions"
    className={['actions', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);
CardActions.displayName = 'Card.Actions';

const CardLink = React.forwardRef<HTMLAnchorElement, CardLinkProps>(
  ({ className = '', children, ...rest }, ref) => (
    <a
      ref={ref}
      data-slot="card-link"
      className={['link', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </a>
  )
);
CardLink.displayName = 'Card.Link';

const CardNote: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <blockquote
    data-slot="card-note"
    className={['note', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </blockquote>
);
CardNote.displayName = 'Card.Note';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Badge: CardBadge,
  Content: CardContent,
  Title: CardTitle,
  Description: CardDescription,
  Media: CardMedia,
  Footer: CardFooter,
  Actions: CardActions,
  Link: CardLink,
  Note: CardNote,
});

export default Card;
