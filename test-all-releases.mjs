import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

async function getAllReleases() {
  try {
    // Get all releases with pagination
    const allReleases = [];
    let page = 1;

    while (true) {
      console.log(`Fetching page ${page}...`);
      const response = await axios.get(
        `${apiUrl}/products/${productId}/releases`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            fields: 'id,name,reference_num,release_date,released',
            per_page: 200,
            page: page
          }
        }
      );

      const releases = response.data.releases || [];
      allReleases.push(...releases);
      console.log(`  Got ${releases.length} releases`);

      if (releases.length < 200) break;
      page++;
    }

    console.log(`\nTotal releases: ${allReleases.length}\n`);

    // Filter to recent/future (2024+)
    const recent = allReleases.filter(r => {
      if (!r.release_date) return !r.released;
      return new Date(r.release_date) >= new Date('2024-01-01');
    });

    console.log(`Recent/Future releases (2024+): ${recent.length}\n`);
    recent.forEach(r => {
      const status = r.released ? 'Released' : 'Upcoming';
      console.log(`${r.reference_num}: "${r.name}" - ${r.release_date || 'No date'} [${status}]`);
    });

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

getAllReleases();
