import React, { PureComponent } from 'react';
import { css, cx } from 'emotion';
import { Themeable, withTheme, GrafanaTheme, selectThemeVariant, LinkButton, getLogRowStyles } from '@grafana/ui';

import { LogsModel, LogRowModel, TimeZone } from '@grafana/data';

import ElapsedTime from './ElapsedTime';

const getStyles = (theme: GrafanaTheme) => ({
  logsRowsLive: css`
    label: logs-rows-live;
    display: flex;
    flex-flow: column nowrap;
    height: 65vh;
    overflow-y: auto;
    :first-child {
      margin-top: auto !important;
    }
  `,
  logsRowFresh: css`
    label: logs-row-fresh;
    color: ${theme.colors.text};
    background-color: ${selectThemeVariant({ light: theme.colors.gray6, dark: theme.colors.gray1 }, theme.type)};
  `,
  logsRowOld: css`
    label: logs-row-old;
    opacity: 0.8;
  `,
  logsRowsIndicator: css`
    font-size: ${theme.typography.size.md};
    padding: ${theme.spacing.sm} 0;
    display: flex;
    align-items: center;
  `,
});

export interface Props extends Themeable {
  logsResult?: LogsModel;
  timeZone: TimeZone;
  stopLive: () => void;
}

class LiveLogs extends PureComponent<Props> {
  private liveEndDiv: HTMLDivElement = null;

  componentDidUpdate(prevProps: Props) {
    if (this.liveEndDiv) {
      this.liveEndDiv.scrollIntoView(false);
    }
  }

  render() {
    const { theme, timeZone } = this.props;
    const styles = getStyles(theme);
    const rowsToRender: LogRowModel[] = this.props.logsResult ? this.props.logsResult.rows : [];
    const showUtc = timeZone === 'utc';
    const { logsRow, logsRowLocalTime, logsRowMessage } = getLogRowStyles(theme);

    return (
      <>
        <div className={cx(['logs-rows', styles.logsRowsLive])}>
          {rowsToRender.map((row: any, index) => {
            return (
              <div
                className={row.fresh ? cx([logsRow, styles.logsRowFresh]) : cx([logsRow, styles.logsRowOld])}
                key={`${row.timeEpochMs}-${index}`}
              >
                {showUtc && (
                  <div className={cx([logsRowLocalTime])} title={`Local: ${row.timeLocal} (${row.timeFromNow})`}>
                    {row.timeUtc}
                  </div>
                )}
                {!showUtc && (
                  <div className={cx([logsRowLocalTime])} title={`${row.timeUtc} (${row.timeFromNow})`}>
                    {row.timeLocal}
                  </div>
                )}
                <div className={cx([logsRowMessage])}>{row.entry}</div>
              </div>
            );
          })}
          <div
            ref={element => {
              this.liveEndDiv = element;
              if (this.liveEndDiv) {
                this.liveEndDiv.scrollIntoView(false);
              }
            }}
          />
        </div>
        <div className={cx([styles.logsRowsIndicator])}>
          <span>
            Last line received: <ElapsedTime resetKey={this.props.logsResult} humanize={true} /> ago
          </span>
          <LinkButton
            onClick={this.props.stopLive}
            size="md"
            variant="transparent"
            style={{ color: theme.colors.orange }}
          >
            Stop Live
          </LinkButton>
        </div>
      </>
    );
  }
}

export const LiveLogsWithTheme = withTheme(LiveLogs);
