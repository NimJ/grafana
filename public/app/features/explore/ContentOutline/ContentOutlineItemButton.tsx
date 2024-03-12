import { cx, css } from '@emotion/css';
import React, { ButtonHTMLAttributes } from 'react';

import { IconName, isIconName, GrafanaTheme2 } from '@grafana/data';
import { Icon, useStyles2, Tooltip, IconSize } from '@grafana/ui';

type CommonProps = {
  title?: string;
  icon?: IconName | React.ReactNode;
  tooltip?: string;
  className?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  isActive?: boolean;
  iconRight?: boolean;
};

export type ContentOutlineItemButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function ContentOutlineItemButton({
  title,
  icon,
  tooltip,
  className,
  collapsible,
  collapsed,
  toggleCollapsed,
  isActive,
  iconRight,
  ...rest
}: ContentOutlineItemButtonProps) {
  const styles = useStyles2(getStyles);

  const buttonStyles = cx(styles.button, className);

  const body = (
    <div className={styles.buttonContainer}>
      {collapsible && (
        <button className={styles.collapseButton} onClick={toggleCollapsed}>
          {renderIcon(collapsed ? 'angle-down' : 'angle-right')}
        </button>
      )}
      <button
        className={cx(buttonStyles, {
          [styles.active]: isActive,
          [styles.iconRight]: iconRight,
        })}
        aria-label={tooltip}
        {...rest}
      >
        {renderIcon(icon)}
        {title && <span className={styles.textContainer}>{title}</span>}
      </button>
    </div>
  );

  return tooltip ? (
    <Tooltip content={tooltip} placement="bottom">
      {body}
    </Tooltip>
  ) : (
    body
  );
}

function renderIcon(icon: IconName | React.ReactNode, size: IconSize = 'lg') {
  if (!icon) {
    return null;
  }

  if (isIconName(icon)) {
    return <Icon name={icon} size={size} />;
  }

  return icon;
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    buttonContainer: css({
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    }),
    button: css({
      label: 'content-outline-item-button',
      display: 'flex',
      flexGrow: 1,
      alignItems: 'center',
      height: theme.spacing(theme.components.height.md),
      padding: theme.spacing(0, 1),
      gap: theme.spacing(1),
      color: theme.colors.text.secondary,
      background: 'transparent',
      border: 'none',
      maxWidth: '155px',
    }),
    collapseButton: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: theme.spacing(3),
      height: theme.spacing(4),
      borderRadius: theme.shape.radius.default,
      color: theme.colors.text.secondary,
      background: 'transparent',
      border: 'none',

      '&:hover': {
        color: theme.colors.text.primary,
        background: theme.colors.secondary.shade,
      },
    }),
    textContainer: css({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    active: css({
      backgroundColor: theme.colors.background.secondary,
      borderTopRightRadius: theme.shape.radius.default,
      borderBottomRightRadius: theme.shape.radius.default,
      position: 'relative',

      '&::before': {
        backgroundImage: theme.colors.gradients.brandVertical,
        borderRadius: theme.shape.radius.default,
        content: '" "',
        display: 'block',
        height: '100%',
        position: 'absolute',
        transform: 'translateX(-50%)',
        width: theme.spacing(0.5),
        left: '2px',
      },
    }),
    iconRight: css({
      justifyContent: 'flex-end',
    }),
  };
};
