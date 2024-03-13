import { css, cx } from '@emotion/css';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { GrafanaTheme2, PageLayoutType } from '@grafana/data';
import { SceneComponentProps } from '@grafana/scenes';
import { CustomScrollbar, useStyles2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import DashboardEmpty from 'app/features/dashboard/dashgrid/DashboardEmpty';
import { useSelector } from 'app/types';

import { DashboardScene } from './DashboardScene';
import { NavToolbarActions } from './NavToolbarActions';
import { Scopes } from './Scopes';

export function DashboardSceneRenderer({ model }: SceneComponentProps<DashboardScene>) {
  const { controls, overlay, editview, editPanel, isEmpty, scopes } = model.useState();
  const { isExpanded: isScopesExpanded } = scopes?.useState() ?? {};
  const styles = useStyles2(getStyles);
  const location = useLocation();
  const navIndex = useSelector((state) => state.navIndex);
  const pageNav = model.getPageNav(location, navIndex);
  const bodyToRender = model.getBodyToRender();
  const navModel = getNavModel(navIndex, 'dashboards/browse');

  if (editview) {
    return (
      <>
        <editview.Component model={editview} />
        {overlay && <overlay.Component model={overlay} />}
      </>
    );
  }

  const emptyState = <DashboardEmpty dashboard={model} canCreate={!!model.state.meta.canEdit} />;

  const withPanels = (
    <div className={cx(styles.body)}>
      <bodyToRender.Component model={bodyToRender} />
    </div>
  );

  return (
    <Page navModel={navModel} pageNav={pageNav} layout={PageLayoutType.Custom}>
      {editPanel && <editPanel.Component model={editPanel} />}
      {!editPanel && (
        <div className={styles.pageContainer}>
          {scopes && isScopesExpanded && <Scopes scopes={scopes} />}
          <CustomScrollbar autoHeightMin={'100%'}>
            <div className={styles.canvasContent}>
              <NavToolbarActions dashboard={model} />
              {(controls || scopes) && (
                <div className={styles.controlsWrapper}>
                  {scopes && !isScopesExpanded && <Scopes scopes={scopes} />}
                  {controls && <controls.Component model={controls} />}
                </div>
              )}
              {isEmpty ? emptyState : withPanels}
            </div>
          </CustomScrollbar>
        </div>
      )}
      {overlay && <overlay.Component model={overlay} />}
    </Page>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    pageContainer: css({
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      height: '100%',
      overflow: 'hidden',
    }),
    canvasContent: css({
      label: 'canvas-content',
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(0, 2),
      flexBasis: '100%',
      flexGrow: 1,
    }),
    body: css({
      label: 'body',
      flexGrow: 1,
      display: 'flex',
      gap: '8px',
      marginBottom: theme.spacing(2),
    }),
    controlsWrapper: css({
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: theme.spacing(1),
      position: 'sticky',
      top: 0,
      background: theme.colors.background.canvas,
      zIndex: theme.zIndex.activePanel,
      padding: theme.spacing(2, 0),
      marginLeft: 'auto',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column-reverse',
        alignItems: 'stretch',
      },
      width: '100%',
    }),
  };
}
