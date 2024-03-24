/** Message types */
export type MessageTypes = 'hover' | 'stop' | 'chunk';

/** Message  */
export interface Message<T> {
  type: MessageTypes;
  content?: T;
}

/** Messanging interface to the `browser.runtime` messaging API */
export class Messager {
  /** Send a message */
  public static send<T>(msg: Message<T>) {
    browser.runtime.sendMessage(msg);
  }

  /** Send on hover event */
  public static hover(href: string) {
    Messager.send<msgTypeGeneric['hover']>({ type: 'hover', content: href });
  }

  /** Send stop event */
  public static stop() {
    Messager.send<msgTypeGeneric['stop']>({ type: 'stop' });
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
  hover: string;
  chunk: string;
};
