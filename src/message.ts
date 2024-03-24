/** Message types */
export type MessageTypes =
  | 'role'
  | 'hover'
  | 'stop'
  | 'article'
  | 'chunk'
  | 'summarize';

/** Message  */
export interface Message<T> {
  type: MessageTypes;
  content?: T;
}

/** Messanging interface to the `browser.runtime` messaging API */
export class Messager {
  /** Send a message */
  public static send<T>(msg: Message<T>) {
    return browser.runtime.sendMessage(msg);
  }

  /** Send on hover event */
  public static hover(href: string) {
    return Messager.send<msgTypeGeneric['hover']>({
      type: 'hover',
      content: href,
    });
  }

  /** Send stop event */
  public static stop() {
    return Messager.send<msgTypeGeneric['stop']>({ type: 'stop' });
  }

  /** Send summary page content */
  public static async sendArticle(content: string) {
    return await Messager.send<msgTypeGeneric['article']>({
      type: 'article',
      content,
    });
  }

  /** Send chunk of summary page content */
  public static sendSummaryChunk(content: { delta: string; text: string }) {
    return Messager.send<msgTypeGeneric['chunk']>({
      type: 'chunk',
      content,
    });
  }

  /** Request tab role (weather it is a summary page or not) */
  public static requestRole(): Promise<Message<boolean>> {
    return Messager.send<msgTypeGeneric['role']>({ type: 'role' });
  }

  /** Subscribe to a specific type of messages */
  public static subscribe<T, K>(
    type: MessageTypes,
    onMessage: (
      message: Message<T>,
      sender: browser.runtime.MessageSender,
      sendResponse: (response?: Message<K>) => void
    ) => void
  ) {
    return browser.runtime.onMessage.addListener(
      (message: Message<T>, sender, response) => {
        if (message.type === type) return onMessage(message, sender, response);
        else return false;
      }
    );
  }

  /** Remove listener */
  public static unsubscribe<T, K>(
    onMessage: (
      message: Message<T>,
      sender: browser.runtime.MessageSender,
      sendResponse: (response?: Message<K>) => void
    ) => void
  ) {
    return browser.runtime.onMessage.removeListener(onMessage);
  }
}

type msgTypeGeneric = {
  stop: undefined;
  role: undefined;
  hover: string;
  chunk: { delta: string; text: string };
  article: string;
  summarize: string[];
};
