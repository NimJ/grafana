import { css, cx } from '@emotion/css';
import React, { useEffect, useRef, useState } from 'react';
import { useToggle, useScroll } from 'react-use';

import { GrafanaTheme2 } from '@grafana/data';
import { reportInteraction } from '@grafana/runtime';
import { useStyles2, PanelContainer, CustomScrollbar } from '@grafana/ui';

import { useContentOutlineContext } from './ContentOutlineContext';
import { ContentOutlineItemButton } from './ContentOutlineItemButton';

const INDENT_LEVELS = {
  ROOT: '32px',
  CHILD_COLLAPSED: '36px',
  CHILD_EXPANDED: '66px',
};

const getStyles = (theme: GrafanaTheme2, expanded: boolean) => {
  const baseIndentStyle = {
    marginLeft: INDENT_LEVELS.ROOT,
    width: '100%',
    '&:hover': {
      color: theme.colors.text.primary,
      textDecoration: 'underline',
    },
  };

  return {
    wrapper: css({
      label: 'wrapper',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      marginRight: theme.spacing(1),
      height: '100%',
      backgroundColor: theme.colors.background.primary,
    }),
    content: css({
      label: 'content',
      marginLeft: theme.spacing(0.5),
      top: 0,
    }),
    buttonStyles: css({
      textAlign: 'right',
      width: '100%',
      padding: theme.spacing(0, 1.5),
      '&:hover': {
        color: theme.colors.text.primary,
        textDecoration: 'underline',
      },
    }),
    iconButton: css({
      justifyContent: 'center',
      width: theme.spacing(4),
      '&:hover': {
        color: theme.colors.text.primary,
        background: theme.colors.background.secondary,
        textDecoration: 'underline',
      },
    }),
    toggleContentOutlineButton: css({
      marginLeft: theme.spacing(0.1),
      '&:hover': {
        color: theme.colors.text.primary,
      },
      transform: expanded ? 'rotate(180deg)' : '',
    }),
    sectionWrapper: css({
      display: 'flex',
    }),
    indentRoot: css(baseIndentStyle),
    indentChildren: css({
      ...baseIndentStyle,
      marginLeft: expanded ? INDENT_LEVELS.CHILD_EXPANDED : INDENT_LEVELS.CHILD_COLLAPSED,
    }),
  };
};

export function ContentOutline({ scroller, panelId }: { scroller: HTMLElement | undefined; panelId: string }) {
  const [contentOutlineExpanded, toggleContentOutlineExpanded] = useToggle(false);
  const [sectionExpanded, toggleSectionExpanded] = useToggle(false);
  const scrollerRef = useRef(scroller || null);
  const { y: verticalScroll } = useScroll(scrollerRef);
  const styles = useStyles2((theme) => getStyles(theme, contentOutlineExpanded));

  const { outlineItems } = useContentOutlineContext() ?? { outlineItems: [] };
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(outlineItems[0]?.id);
  const [activeSectionChildId, setActiveSectionChildId] = useState<string | undefined>(
    outlineItems[0]?.children?.[0]?.id
  );

  const scrollIntoView = (ref: HTMLElement | null, itemPanelId: string, customOffsetTop = 0) => {
    let scrollValue = 0;
    let el: HTMLElement | null | undefined = ref;

    do {
      scrollValue += el?.offsetTop || 0;
      el = el?.offsetParent as HTMLElement;
    } while (el && el !== scroller);

    scroller?.scroll({
      top: scrollValue + customOffsetTop,
      behavior: 'smooth',
    });

    reportInteraction('explore_toolbar_contentoutline_clicked', {
      item: 'select_section',
      type: itemPanelId,
    });
  };

  const toggle = () => {
    toggleContentOutlineExpanded();
    reportInteraction('explore_toolbar_contentoutline_clicked', {
      item: 'outline',
      type: contentOutlineExpanded ? 'minimize' : 'expand',
    });
  };

  const toggleSection = () => {
    toggleSectionExpanded();
    reportInteraction('explore_toolbar_contentoutline_clicked', {
      item: 'section',
      type: sectionExpanded ? 'minimize' : 'expand',
    });
  };

  const outlineItemsHaveChildren = outlineItems.some((item) => item.children);

  useEffect(() => {
    let activeItem;

    for (const item of outlineItems) {
      let top = item?.ref?.getBoundingClientRect().top;

      // Check item
      if (top && top >= 0) {
        activeItem = item;
      }

      // Check children
      const activeChild = item.children?.find((child) => {
        const offsetTop = child.customTopOffset || 0;
        let childTop = child?.ref?.getBoundingClientRect().top;
        return childTop && childTop >= offsetTop;
      });

      if (activeChild) {
        setActiveSectionChildId(activeChild.id);
        setActiveSectionId(item.id);
        break;
      }

      if (activeItem) {
        setActiveSectionId(activeItem.id);
        setActiveSectionChildId(undefined);
        break;
      }
    }
  }, [outlineItems, verticalScroll, sectionExpanded]);

  return (
    <PanelContainer className={styles.wrapper} id={panelId}>
      <CustomScrollbar>
        <div className={styles.content}>
          <ContentOutlineItemButton
            icon={'arrow-from-right'}
            tooltip={contentOutlineExpanded ? 'Collapse outline' : 'Expand outline'}
            onClick={toggle}
            className={styles.toggleContentOutlineButton}
            aria-expanded={contentOutlineExpanded}
          />

          {outlineItems.map((item) => (
            <React.Fragment key={item.id}>
              <ContentOutlineItemButton
                key={item.id}
                title={contentOutlineExpanded ? item.title : undefined}
                className={cx(styles.buttonStyles, {
                  [styles.indentRoot]: outlineItemsHaveChildren && item.children?.length === 0,
                })}
                icon={item.icon}
                onClick={() => scrollIntoView(item.ref, item.panelId)}
                tooltip={!contentOutlineExpanded ? item.title : undefined}
                collapsible={item.children && item.children.length > 0 ? true : undefined}
                collapsed={sectionExpanded}
                toggleCollapsed={toggleSection}
                isActive={activeSectionId === item.id}
              />
              {item.children &&
                sectionExpanded &&
                item.children.map((child) => (
                  <ContentOutlineItemButton
                    key={child.id}
                    title={contentOutlineExpanded ? child.title : undefined}
                    icon={contentOutlineExpanded ? undefined : item.icon}
                    className={styles.indentChildren}
                    onClick={() => scrollIntoView(child.ref, child.panelId, child.customTopOffset)}
                    tooltip={!contentOutlineExpanded ? child.title : undefined}
                    isActive={activeSectionChildId === child.id}
                  />
                ))}
            </React.Fragment>
          ))}
        </div>
      </CustomScrollbar>
    </PanelContainer>
  );
}
