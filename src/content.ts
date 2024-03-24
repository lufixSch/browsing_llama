import { Stream } from 'openai/streaming.mjs';
import LLMInterface from './llm';
import { Message, Messager } from './message';
import Settings from './settings';
import { URLValidator } from './validator';
import OpenAI from 'openai';

let stream: Stream<OpenAI.Chat.ChatCompletionChunk> | null = null;

/** Convert href to absolute URL */
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

async function createSummary(msg: Message<string>) {
  const llm = new LLMInterface(
    await Settings.openaiEndpoint,
    await Settings.openaiKey
  );

  stream = await llm.generateSummary(msg.content!);

  let text = '';
  for await (const message of stream) {
    text += message.choices[0].delta.content || '';
  }
  console.log(text);
}

/** Create summary on hover over the link */
function onHover(ev: Event) {
  Messager.subscribe('summarize', createSummary);
  const url = hrefToUrl((ev.target as HTMLAnchorElement)?.getAttribute('href'));
  if (url) Messager.hover(url.href);
}

/** Stop summarizing */
function onStop() {
  console.log('Stop');
  if (stream) {
    stream.controller.abort();
    stream = null;
  }
  Messager.stop();
}

/** Find all (valid) links on the page and register a hover listener for them */
function registerReferences(
  containers: NodeListOf<HTMLElement>,
  urlValidator: URLValidator
) {
  let crossReferences: HTMLAnchorElement[] = [];
  for (const container of containers) {
    crossReferences = [
      ...crossReferences,
      ...container.querySelectorAll<HTMLAnchorElement>('a[href]'),
    ];
  }

  crossReferences = crossReferences.filter((el) => {
    const ref = hrefToUrl(el.getAttribute('href'));
    const isValid =
      ref &&
      urlValidator.validateURL(ref) &&
      urlValidator.validateReference(ref);

    return isValid;
  });

  crossReferences.forEach((ref) => {
    ref.addEventListener('mouseenter', onHover);
    ref.addEventListener('mouseleave', onStop);
    ref.addEventListener('click', onStop);
  });
}

/** Gather page content for summarization */
function getContent(containers: NodeListOf<HTMLElement>) {
  const sections = [...containers].map((el) => el.innerText);
  return `#${document.title}\n\n${sections.join('\n\n')}`;
}

(async () => {
  // Configure page
  const refContainers = await Settings.refContainers;
  const urlValidator = new URLValidator(
    await Settings.whitelist,
    await Settings.blacklist,
    await Settings.validRefPaths
  );

  // Check if Browsing LLaMa is enabled for this domain
  const currPage = new URL(document.location.href);
  if (!urlValidator.validateURL(currPage)) {
    console.debug('Invalid URL: ', currPage);
    return;
  }

  // Find valid containers with content
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

  // Find out if tab was opend from extension
  const roleRes = await Messager.requestRole();

  if (roleRes.content) {
    const content = getContent(containers);
    Messager.sendArticle(content);
  }

  registerReferences(containers, urlValidator);
})();
