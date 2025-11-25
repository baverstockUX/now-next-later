import axios from 'axios';

class AIService {
  async summarize(text, provider = 'oneadvanced') {
    try {
      if (provider === 'gemini') {
        return await this.summarizeWithGemini(text);
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
    const url = process.env.ONEADVANCED_AI_URL;
    const apiKey = process.env.ONEADVANCED_AI_KEY;

    if (!url || !apiKey) {
      throw new Error('OneAdvanced AI configuration missing');
    }

    const response = await axios.post(
      url,
      {
        prompt: `Create a customer-friendly summary of this product feature in 1-2 sentences. Focus on the benefit to customers, avoid technical jargon:\n\n${text}`,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.summary || response.data.text || text;
  }

  async summarizeWithGemini(text) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API configuration missing');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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

  async batchSummarize(items, provider = 'oneadvanced') {
    const summaries = [];

    for (const item of items) {
      const text = `${item.title}. ${item.description || ''}`;
      const summary = await this.summarize(text, provider);
      summaries.push({
        ...item,
        ai_summary: summary
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return summaries;
  }
}

export default new AIService();
