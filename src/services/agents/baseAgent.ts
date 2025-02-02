import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class BaseAgent {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor(systemPrompt: string) {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.systemPrompt = systemPrompt;
  }

  protected async generateCompletion(
    messages: ChatCompletionMessageParam[],
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages
        ],
        temperature,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error('Failed to generate completion. Please try again.');
    }
  }
}