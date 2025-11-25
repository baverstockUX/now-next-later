import axios from 'axios';

class AhaService {
  constructor() {
    this.apiUrl = process.env.AHA_API_URL;
    this.apiKey = process.env.AHA_API_KEY;
    this.productId = process.env.AHA_PRODUCT_ID;
  }

  async fetchInitiatives() {
    try {
      if (!this.apiUrl || !this.apiKey || !this.productId) {
        throw new Error('AHA! API configuration is incomplete');
      }

      const response = await axios.get(
        `${this.apiUrl}/products/${this.productId}/features`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            fields: 'id,name,description,workflow_status,release,created_at'
          }
        }
      );

      return this.transformAhaData(response.data);
    } catch (error) {
      console.error('Error fetching from AHA!:', error.message);
      throw new Error(`Failed to fetch data from AHA!: ${error.message}`);
    }
  }

  transformAhaData(ahaData) {
    // Transform AHA! data into our format
    const features = ahaData.features || [];

    return features.map(feature => {
      const column = this.mapWorkflowStatusToColumn(feature.workflow_status?.name);
      const timeline = this.extractTimeline(feature.release);
      const description = this.extractDescription(feature.description);

      return {
        aha_id: feature.id,
        title: feature.name,
        description: description,
        timeline: timeline,
        column_name: column,
        raw_aha_data: feature
      };
    });
  }

  extractDescription(description) {
    // Handle different description formats from AHA!
    if (!description) return '';

    // If description is an object with a body field, extract it
    if (typeof description === 'object' && description.body) {
      return this.stripHtml(description.body);
    }

    // If it's already a string, clean it
    if (typeof description === 'string') {
      return this.stripHtml(description);
    }

    return '';
  }

  stripHtml(html) {
    // Remove HTML tags and decode entities
    if (!html) return '';

    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&')  // Replace &amp; with &
      .replace(/&lt;/g, '<')   // Replace &lt; with <
      .replace(/&gt;/g, '>')   // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .trim();                 // Remove leading/trailing whitespace
  }

  mapWorkflowStatusToColumn(status) {
    // Map AHA! workflow status to our columns
    // Customize this based on your AHA! workflow
    const statusLower = (status || '').toLowerCase();

    if (statusLower.includes('shipped') || statusLower.includes('released') || statusLower.includes('done')) {
      return 'done';
    } else if (statusLower.includes('in progress') || statusLower.includes('development') || statusLower.includes('building')) {
      return 'now';
    } else if (statusLower.includes('planned') || statusLower.includes('ready')) {
      return 'next';
    } else {
      return 'explore';
    }
  }

  extractTimeline(release) {
    if (!release) return null;

    // Extract month/year from release date
    if (release.release_date) {
      const date = new Date(release.release_date);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return release.name || null;
  }
}

export default new AhaService();
