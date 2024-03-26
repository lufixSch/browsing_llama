import { Stream } from 'openai/streaming.mjs';
import LLMInterface from './llm';
import { Message, Messager } from './message';
import Settings from './settings';
import { URLValidator } from './validator';
import OpenAI from 'openai';

Messager.subscribe('summarize', createSummary);

let stream: Stream<OpenAI.Chat.ChatCompletionChunk> | undefined;
let requestStop: boolean = false;
let anchor: HTMLAnchorElement | null = null;
let summaryTimeout: NodeJS.Timeout | null = null;

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

  if (anchor == null) throw new Error('Missing anchor');

  if (requestStop) {
    requestStop = false;
    return;
  }

  // Build div to display the summary
  const summaryBox = anchor.appendChild(document.createElement('div'));
  const textBox = summaryBox.appendChild(document.createElement('div'));
  textBox.innerText = 'Loading...';
  summaryBox.classList.add('browsing-llama-summary-box');

  stream = await llm.generateSummary(msg.content!);
  if (requestStop) {
    stream.controller.abort('Stopped before stream could start!');
    requestStop = false;
    return;
  }

  // Add summary to div durring generation
  let text = '';
  for await (const message of stream) {
    console.log(message);
    text += message.choices[0].delta.content || '';

    // Update summary box only if `text` has a value (keeps the 'Loading...' text for longer)
    if (text) {
      textBox.innerText = text;
    }
  }

  console.debug('Finished summarizing!');
}

/** Create summary on hover over the link */
function onHover(ev: Event) {
  anchor = ev.target as HTMLAnchorElement;

  if (
    [...anchor.childNodes].reduce(
      (_hasSummary, el) =>
        (el as HTMLElement).classList?.contains('browsing-llama-summary-box'),
      false
    )
  )
    return;

  const url = hrefToUrl(anchor.getAttribute('href'));

  // Wait befor starting summary to avoid race condition with stop message (which keeps tabs open)
  summaryTimeout = setTimeout(() => {
    summaryTimeout = null;
    if (url) Messager.hover(url.href);
  }, 100);
}

/** Stop summarizing */
function onStop() {
  console.log('Stop');

  if (stream) {
    stream.controller.abort('Stopped!');
  } else if (summaryTimeout) {
    clearTimeout(summaryTimeout);
    summaryTimeout = null;
  } else {
    requestStop = true;
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
