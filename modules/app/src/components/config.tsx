import { AppPluginMeta, PluginConfigPageProps } from '@grafana/data';
import { BackendSrv, config, getBackendSrv, getLocationSrv } from '@grafana/runtime';
import { Button, InfoBox } from '@grafana/ui';
import React, { PureComponent } from 'react';
import { DataSourceType, GlobalSettings } from '../types';

/**
 * Plug-in Path
 */
const HOME_PATH = 'a/toong-app/';

/**
 * Page Properties
 */
interface Props extends PluginConfigPageProps<AppPluginMeta<GlobalSettings>> {
}

/**
 * State
 */
interface State {
  isConfigured: boolean;
  isEnabled: boolean;
}

/**
 * Config component
 */
export class Config extends PureComponent<Props, State> {
  /**
   * Object to get the current page
   */
  static getLocation(): Location {
    return window.location;
  }

  /**
   * Service to communicate via http(s) to a remote backend such as the Grafana backend, a datasource etc.
   */
  private backendSrv: BackendSrv = getBackendSrv();

  /**
   * Constructor
   *
   * @param props {Props} Properties
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      isConfigured: false,
      isEnabled: false,
    };
  }

  /**
   * Mount
   */
  componentDidMount(): void {
    if (this.props.plugin.meta?.enabled) {
      const datasources = Object.values(config.datasources).filter((ds) => {
        return ds.type === DataSourceType.TOONG_DATASOURCE.label;
      });

      /**
       * Datasources found
       */
      this.setState({
                      isConfigured: datasources.length > 0,
                      isEnabled: true,
                    });
    }
  }

  /**
   * Update
   */
  onUpdate = () => {
    if (!this.state.isEnabled) {
      return;
    }

    this.goHome();
  };

  /**
   * Home
   */
  goHome = (): void => {
    getLocationSrv().update({
                              path: HOME_PATH,
                              partial: false,
                            });
  };

  /**
   * Plug-in Settings
   *
   * @param settings Plugin Settings
   */
  updatePluginSettings = (settings: { enabled: boolean; jsonData: unknown; pinned: boolean }): Promise<undefined> => {
    return this.backendSrv.post(`api/plugins/${this.props.plugin.meta.id}/settings`, settings);
  };

  /**
   * Plug-in disable
   */
  onDisable = () => {
    this.updatePluginSettings({ enabled: false, jsonData: {}, pinned: false }).then(() => {
      Config.getLocation().reload();
    });
  };

  /**
   * Plug-in enable
   */
  onEnable = () => {
    this.updatePluginSettings({ enabled: true, jsonData: {}, pinned: true }).then(() => {
      Config.getLocation().assign(HOME_PATH);
    });
  };

  /**
   * Page Render
   */
  render() {
    const { isConfigured, isEnabled } = this.state;

    return (
      <>
        <InfoBox>
          <h2>Toong Application</h2>
          <p>
            The Toong Application, is a plug-in for Grafana that provides custom panels for automation provisioning
            software to IoT devices.
          </p>
          {isConfigured ? (
            <p>
              Click <b>Update</b> to reload the Application configuration.
            </p>
          ) : (
             <p>
               Click below to <b>Enable</b> the Application and start monitoring your automation today.
             </p>
           )}
        </InfoBox>
        <div className="gf-form gf-form-button-row">
          {isConfigured && <Button onClick={this.onUpdate}>Update</Button>}
          {isEnabled ? (
            <Button variant="destructive" onClick={this.onDisable}>
              Disable
            </Button>
          ) : (
             <Button onClick={this.onEnable}>Enable</Button>
           )}
        </div>
      </>
    );
  }
}
