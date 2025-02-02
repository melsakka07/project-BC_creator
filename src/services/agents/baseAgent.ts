import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

export class BaseAgent {
  protected openai: OpenAI;
  protected systemPrompt: string;

  constructor(systemPrompt: string) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please add your API key to the .env file.');
    }
    
    if (apiKey === 'your_openai_api_key_here') {
      throw new Error('Please replace the placeholder with your actual OpenAI API key in the .env file.');
    }

    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use server-side API calls
    });
    this.systemPrompt = systemPrompt;
  }

  protected async generateCompletion(
    messages: ChatCompletionMessageParam[],
    temperature = 0.7
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages
        ],
        temperature,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate completion');
    }
  }
}