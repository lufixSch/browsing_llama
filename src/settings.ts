/** Manage the settings for the application stored in `browser.storage.sync` */
export default class Settings {
  static openaiEndpointDefault = 'http://localhost:5000/v1';
  static openaiKeyDefault = 'sk-11111111111111111111111111';
  static whitelistDefault = [];
  static blacklistDefault = [];
  static refContainersDefault = ['article', 'section', 'main'];
  static validRefPathsDefault =
    '^/(.*\\.(php|html|[0-9]|md|txt|htm)|((?!\\.).)*)/?$'; // regex matching pathnames ending on .php, .html, .md, .txt, .htm, [0-9] (for paths ending on a version number) or don't contain a dot

  /** Get stored openai api endpoint */
  static get openaiEndpoint() {
    return Settings.get('openai_api_key', Settings.openaiEndpointDefault);
  }

  /** update opneai api endpoint */
  static setOpenaiEndpoint(val: string) {
    return Settings.set('openai_api_key', val);
  }

  /** Get stored openai api key */
  static get openaiKey() {
    return Settings.get('openai_key', Settings.openaiKeyDefault);
  }

  /** update opneai api key */
  static setOpenaiKey(val: string) {
    return Settings.set('openai_key', val);
  }

  /** Get stored whitelist of allowed domains to search for links and allowed domains to open*/
  static get whitelist() {
    return Settings.get('whitelist', Settings.whitelistDefault);
  }

  /** update whitelist */
  static setWhitelist(val: string) {
    return Settings.set('whitelist', val);
  }

  /** Get stored blacklist of domains to ignore */
  static get blacklist() {
    return Settings.get('whitelist', Settings.blacklistDefault);
  }

  /** update blacklist */
  static setBlacklist(val: string) {
    return Settings.set('blacklist', val);
  }

  /** Get stored ref containers */
  static get refContainers() {
    return Settings.get('ref_containers', Settings.refContainersDefault);
  }

  /** update ref containers */
  static setRefContainers(val: string) {
    return Settings.set('ref_containers', val);
  }

  /** Get stored valid ref paths */
  static get validRefPaths() {
    return Settings.get('valid_ref_paths', Settings.validRefPathsDefault);
  }

  /** update valid ref paths */
  static setValidRefPaths(val: string) {
    return Settings.set('valid_ref_paths', val);
  }

  static async get<T>(name: string, defaultValue: T): Promise<T> {
    const vals: { [key: string]: any } = browser.storage.sync.get(name);
    return (vals[name] as T) || defaultValue;
  }

  static set<T>(name: string, value: T): Promise<void> {
    const values: { [key: string]: T } = {};
    values[name] = value;
    return browser.storage.sync.set(values);
  }
}
