"use client";
import * as React from 'react'
import Button from '../Button';
import Styles from "./AlertNotice.module.scss";
export type AlertNoticeProps = {
  status?: "info" | "success" | "warning" | "danger";
  level?: "page" | "section" | "inline";
  index: number;
  dismissible?: boolean;
  onDismiss?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & AlertNoticeProps
>(
  (
    {
      status = "info",
      level,
      dismissible,
      onDismiss,
      className,
      index,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      role="alert"
      className={`${Styles.alert} ${Styles[`alert__${level}`]} ${Styles[`alert__${level}--${status}`]
        }`}
      {...props}
    >
      {props.children}
      {dismissible && onDismiss && (
        <div className={Styles["__dismiss"]}>
          <Button
            variant="tertiary"
            handleClick={onDismiss}
            title="Dismiss this alert"
            data-index={index}
          >
            <i className="fa fa-times">
              <span>Dismiss this alert</span>
            </i>
          </Button>
        </div>
      )}
    </div>
  )
);
Container.displayName = "AlertNotice.Container";

const Title = ({ children }: { children: React.ReactNode }) => (
  <h6 className={Styles["__title"]}>{children}</h6>
);
Title.displayName = "AlertNotice.Title";

const BodyContent = ({ children }: { children: React.ReactNode }) => (
  <div className={Styles["__body"]}>{children}</div>
);
BodyContent.displayName = "AlertNotice.Body";

const Icon = ({ status }: { status: string }) => {
  const icons = {
    info: "info-circle",
    success: "check-circle",
    warning: "exclamation-triangle",
    danger: "exclamation-circle",
  };

  return (
    <div className={Styles["__icon"]}>
      <i className={`fa fa-${icons[status]}`} aria-hidden="true" />
    </div>
  );
};
Icon.displayName = "AlertNotice.Icon";

export { Container, Title, BodyContent, Icon };
