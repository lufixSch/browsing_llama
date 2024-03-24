export class URLValidator {
  constructor(
    private whitelist: string[],
    private blacklist: string[],
    private validRefPaths: string
  ) {}

  /** Validates a URL against the whitelist and blacklist */
  validateURL(url: URL): boolean {
    if (this.blacklist.includes(url.hostname)) {
      return false;
    }

    if (this.whitelist.length === 0) {
      return true;
    }

    if (!this.whitelist.includes(url.hostname)) {
      return false;
    }

    return true;
  }

  /** Validates a ref path against the valid ref paths */
  validateReference(url: URL) {
    return RegExp(this.validRefPaths).test(url.pathname);
  }
}
