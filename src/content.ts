import { Messager } from './message';
import Settings from './settings';
import { URLValidator } from './validator';

function hrefToUrl(href: string | null | undefined) {
  if (href == '' || href == null || href == undefined) {
    return undefined;
  }

  if (href.startsWith('#')) {
    // TODO Summarize the referenced section
    return undefined;
  }

  if (href.startsWith('/')) {
    return new URL(document.location.origin + href);
  }

  return new URL(href);
}

(async () => {
  const refContainers = await Settings.refContainers;
  const urlValidator = new URLValidator(
    await Settings.whitelist,
    await Settings.blacklist,
    await Settings.validRefPaths
  );

  const currPage = new URL(document.location.href);
  console.log(currPage);
  if (!urlValidator.validateURL(currPage)) {
    console.log('Invalid URL: ', currPage);
    return;
  }

  let containers: NodeListOf<HTMLElement> | undefined;
  for (const ref_container of refContainers) {
    containers = document.querySelectorAll(ref_container);
    if (containers.length) {
      break;
    }
  }

  if (containers === undefined || containers.length === 0) {
    console.error('No reference containers found');
    return;
  }

  let crossReferences: HTMLAnchorElement[] = [];
  for (const container of containers) {
    crossReferences = [
      ...crossReferences,
      ...container.querySelectorAll<HTMLAnchorElement>('a[href]'),
    ];
  }

  console.log(crossReferences);

  crossReferences = crossReferences.filter((el) => {
    const ref = hrefToUrl(el.getAttribute('href'));
    const isValid =
      ref &&
      urlValidator.validateURL(ref) &&
      urlValidator.validateReference(ref);

    if (!isValid)
      console.log(
        ref,
        ref ? urlValidator.validateURL(ref) : '-',
        ref ? urlValidator.validateReference(ref) : '-'
      );

    return isValid;
  });

  console.log(crossReferences);

  crossReferences.forEach((ref) => {
    ref.addEventListener('mouseenter', (ev) => {
      console.log(ev);
      const url = hrefToUrl(
        (ev.target as HTMLAnchorElement)?.getAttribute('href')
      );
      if (url) Messager.hover(url.href);
    });
    ref.addEventListener('mouseleave', () => {
      Messager.stop();
    });
  });
})();
