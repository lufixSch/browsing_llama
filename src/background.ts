import { Message, Messager } from './message';

let summaryTab: browser.tabs.Tab | null = null;

Messager.subscribe('hover', onHover);
Messager.subscribe('stop', onStop);
Messager.subscribe('article', onArticle);
Messager.subscribe<undefined, boolean>('role', sendRole);

async function onHover(
  message: Message<string>,
  sender: browser.runtime.MessageSender
) {
  await browser.storage.local.set({ current_tab: sender.tab?.id });
  summaryTab = await browser.tabs.create({
    active: false,
    openerTabId: sender.tab?.id,
    url: message.content,
  });
}

async function onStop() {
  if (summaryTab && summaryTab.id) {
    await browser.tabs.remove(summaryTab.id);
    summaryTab = null;
  }
}

/** Send content to active tab */
async function onArticle(message: Message<string>) {
  const currentTab =
    (await browser.storage.local.get('current_tab'))['current_tab'] ||
    undefined;
  if (!currentTab) throw new Error('No current tab');

  console.log('sending article to tab', currentTab);
  await browser.tabs.sendMessage(currentTab, {
    type: 'summarize',
    content: message.content,
  });
}

/** Evaluate the role of the messaging tab */
function sendRole(
  _message: Message<undefined>,
  sender: browser.runtime.MessageSender,
  response: (msg: Message<boolean> | undefined) => void
) {
  const isSummary = sender.tab?.id === summaryTab?.id;
  response({ type: 'role', content: isSummary });
}
