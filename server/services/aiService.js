import axios from 'axios';

class AIService {
  getAvailableModels() {
    const models = [];

    // Check if OneAdvanced AI is configured
    if (process.env.ONEADVANCED_AI_KEY) {
      models.push({
        id: 'oneadvanced',
        name: 'OneAdvanced AI',
        provider: 'oneadvanced'
      });
    }

    // Check if Gemini is configured
    if (process.env.GEMINI_API_KEY) {
      models.push(
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          provider: 'gemini'
        },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          provider: 'gemini'
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          provider: 'gemini'
        }
      );
    }

    return models;
  }

  async summarize(text, model = 'oneadvanced') {
    try {
      // Map legacy provider names to models for backward compatibility
      if (model === 'gemini') {
        model = 'gemini-2.0-flash';
      }

      if (model.startsWith('gemini')) {
        return await this.summarizeWithGemini(text, model);
      } else {
        return await this.summarizeWithOneAdvanced(text);
      }
    } catch (error) {
      console.error('AI summarization error:', error.message);
      // Return a simple fallback summary
      return this.createFallbackSummary(text);
    }
  }

  async summarizeWithOneAdvanced(text) {
    const apiKey = process.env.ONEADVANCED_AI_KEY;

    if (!apiKey) {
      throw new Error('OneAdvanced AI configuration missing');
    }

    const response = await axios.post(
      'https://apim.oneadvanced.io/platform/oneadvanced-ai/v2/chat/completions',
      {
        temperature: 0.7,
        max_completion_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Create a customer-friendly summary of this product feature in 1-2 sentences. Focus on the benefit to customers, avoid technical jargon:\n\n${text}`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the response from the chat completion format
    const message = response.data?.choices?.[0]?.message?.content;
    return message || text;
  }

  async summarizeWithGemini(text, model = 'gemini-2.0-flash') {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API configuration missing');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: `Create a customer-friendly summary of this product feature in 1-2 sentences. Focus on the benefit to customers, avoid technical jargon:\n\n${text}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const candidates = response.data?.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts) {
      return candidates[0].content.parts[0].text || text;
    }

    return text;
  }

  createFallbackSummary(text) {
    // Simple fallback: take first 150 characters
    if (!text) return '';

    const cleaned = text.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
    return cleaned.length > 150
      ? cleaned.substring(0, 147) + '...'
      : cleaned;
  }

  async batchSummarize(items, model = 'oneadvanced', progressCallback = null) {
    const summaries = [];
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const text = `${item.title}. ${item.description || ''}`;
      const summary = await this.summarize(text, model);
      summaries.push({
        ...item,
        ai_summary: summary
      });

      // Report progress if callback provided
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total,
          step: 'ai_summary',
          message: `Generating AI summary ${i + 1} of ${total}`
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return summaries;
  }
}

export default new AIService();
