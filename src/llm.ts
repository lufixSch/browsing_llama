import OpenAI from 'openai';

export type LLmResponse = AsyncGenerator<
  { delta: string; text: string },
  void,
  unknown
>;

export type ChatRoles = 'system' | 'user' | 'assistant';

export default class LLMInterface {
  public client: OpenAI;

  constructor(apiEndpoint: string, apiKey: string) {
    this.client = new OpenAI({
      baseURL: apiEndpoint,
      apiKey: apiKey ? apiKey : undefined,
      dangerouslyAllowBrowser: true,
    });
  }

  public async chat(messages: { role: ChatRoles; content: string }[]) {
    return await this.client.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
    });
  }

  public async chatStream(messages: { role: ChatRoles; content: string }[]) {
    return await this.client.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
      stream: true,
    });
  }

  public async generateSummary(content: string) {
    return await this.chatStream([
      {
        role: 'system',
        content:
          'You are a Researcher with the ability to summarize the essence of an article into 2 to 3 sentences. The user will provide the article, and you will return the summary. You will only return the summary!',
      },
      {
        role: 'user',
        content: `Summarize the following article:\n${content}`,
      },
    ]);
  }
}
