import axios from 'axios';

class AhaService {
  constructor() {
    this.apiUrl = process.env.AHA_API_URL;
    this.apiKey = process.env.AHA_API_KEY;
    this.productId = process.env.AHA_PRODUCT_ID;
  }

  async fetchInitiatives(selectedReleases = []) {
    try {
      if (!this.apiUrl || !this.apiKey || !this.productId) {
        throw new Error('AHA! API configuration is incomplete');
      }

      console.log('Selected releases for sync:', selectedReleases.length > 0 ? selectedReleases.join(', ') : 'ALL');

      //If no releases selected, return empty to avoid syncing everything
      if (!selectedReleases || selectedReleases.length === 0) {
        console.log('No releases selected - skipping sync');
        return [];
      }

      // Fetch features for each selected release
      const allFeatures = [];

      for (const releaseName of selectedReleases) {
        console.log(`Fetching features for release: ${releaseName}`);
        try {
          const response = await axios.get(
            `${this.apiUrl}/products/${this.productId}/features`,
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              params: {
                fields: 'id,name,description,workflow_status,release,created_at,updated_at',
                per_page: 200,
                q: `release.name:"${releaseName}"` // Filter by release name
              }
            }
          );

          const features = response.data.features || [];
          console.log(`  Found ${features.length} features in ${releaseName}`);
          allFeatures.push(...features);
        } catch (releaseError) {
          console.error(`Error fetching features for ${releaseName}:`, releaseError.message);
        }
      }

      console.log(`Total features fetched across all selected releases: ${allFeatures.length}`);
      return this.transformAhaData({ features: allFeatures });
    } catch (error) {
      console.error('Error fetching from AHA!:', error.message);
      throw new Error(`Failed to fetch data from AHA!: ${error.message}`);
    }
  }

  async fetchAvailableReleases() {
    try {
      if (!this.apiUrl || !this.apiKey || !this.productId) {
        throw new Error('AHA! API configuration is incomplete');
      }

      const allReleases = [];
      let page = 1;

      // Fetch all releases with pagination
      while (true) {
        const response = await axios.get(
          `${this.apiUrl}/products/${this.productId}/releases`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            params: {
              fields: 'id,name,release_date,released',
              per_page: 200,
              page: page
            }
          }
        );

        const releases = response.data.releases || [];
        allReleases.push(...releases);

        if (releases.length < 200) break;
        page++;
      }

      // Filter to future/current releases (2024+) and sort by date
      const futureReleases = allReleases
        .filter(r => {
          if (!r.release_date) return !r.released; // Include upcoming releases without dates
          return new Date(r.release_date) >= new Date('2024-01-01');
        })
        .sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date) : new Date('2099-12-31');
          const dateB = b.release_date ? new Date(b.release_date) : new Date('2099-12-31');
          return dateA - dateB;
        });

      return futureReleases;
    } catch (error) {
      console.error('Error fetching releases from AHA!:', error.message);
      throw new Error(`Failed to fetch releases from AHA!: ${error.message}`);
    }
  }

  transformAhaData(ahaData) {
    // Transform AHA! data into our format
    const features = ahaData.features || [];
    const cutoffDate = new Date('2025-01-01'); // Only show DONE items from Jan 2025 onwards

    // Log unique workflow statuses for debugging
    const statuses = new Set();
    features.forEach(f => {
      if (f.workflow_status?.name) {
        statuses.add(f.workflow_status.name);
      }
    });
    console.log('AHA! Workflow statuses found:', Array.from(statuses).join(', '));
    console.log('Total features fetched:', features.length);

    return features
      .map(feature => {
        const column = this.mapWorkflowStatusToColumn(feature.workflow_status?.name);
        const timeline = this.extractTimeline(feature.release);
        const description = this.extractDescription(feature.description);
        const releaseDate = feature.release?.release_date ? new Date(feature.release.release_date) : null;
        const workflowStatus = feature.workflow_status?.name || '';

        return {
          aha_id: feature.id,
          title: feature.name,
          description: description,
          timeline: timeline,
          column_name: column,
          release_date: releaseDate,
          workflow_status: workflowStatus,
          raw_aha_data: feature
        };
      })
      .filter(feature => {
        // EXCLUDE "Will Not Implement" items completely
        if (feature.workflow_status.toLowerCase().includes('will not')) {
          console.log(`Filtering out "Will Not Implement": ${feature.title}`);
          return false;
        }

        // If it's in the DONE column, only include if release date is >= Jan 2025
        if (feature.column_name === 'done') {
          const included = feature.release_date && feature.release_date >= cutoffDate;
          if (!included) {
            console.log(`Filtering out old DONE item: ${feature.title} (${feature.timeline})`);
          }
          return included;
        }

        // Include all other items (in-progress, planned, etc.)
        return true;
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

    // DONE: Completed/shipped items
    if (statusLower.includes('shipped') ||
        statusLower.includes('released') ||
        statusLower.includes('done') ||
        statusLower.includes('complete') ||
        statusLower.includes('live')) {
      return 'done';
    }

    // NOW: Currently being worked on
    if (statusLower.includes('in progress') ||
        statusLower.includes('development') ||
        statusLower.includes('building') ||
        statusLower.includes('in dev') ||
        statusLower.includes('active') ||
        statusLower.includes('working')) {
      return 'now';
    }

    // NEXT: Planned/ready to start
    if (statusLower.includes('planned') ||
        statusLower.includes('ready') ||
        statusLower.includes('scheduled') ||
        statusLower.includes('approved') ||
        statusLower.includes('committed')) {
      return 'next';
    }

    // EXPLORE: Everything else (new, under consideration, etc.)
    return 'explore';
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
