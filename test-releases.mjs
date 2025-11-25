import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function test() {
  const baseUrl = process.env.AHA_API_URL + '/products/' + process.env.AHA_PRODUCT_ID;

  console.log('Fetching ALL releases from AHA! (paginated)...\n');

  const allReleases = [];
  let page = 1;
  while (true) {
    const response = await axios.get(baseUrl + '/releases', {
      headers: { 'Authorization': 'Bearer ' + process.env.AHA_API_KEY },
      params: {
        per_page: 200,
        page: page,
        fields: 'id,name,release_date,released'
      }
    });

    const releases = response.data.releases || [];
    allReleases.push(...releases);
    console.log(`Page ${page}: ${releases.length} releases`);

    if (releases.length < 200) break;
    page++;
  }

  console.log(`\nTotal releases: ${allReleases.length}`);

  // Show releases that look like FY26, FY27, or 3.52
  console.log('\nReleases containing "FY26", "FY27", "3.52", "3.53":');
  allReleases
    .filter(r => r.name.includes('FY26') || r.name.includes('FY27') || r.name.includes('3.52') || r.name.includes('3.53'))
    .forEach(r => {
      console.log(`  ${r.name} [${r.release_date || 'No date'}] ${r.released ? 'Released' : 'Upcoming'}`);
    });

  // Show most recent by name (last 10)
  console.log('\nLast 10 releases (by name):');
  allReleases
    .slice(-10)
    .forEach(r => {
      console.log(`  ${r.name} [${r.release_date || 'No date'}]`);
    });
}

test().catch(e => console.log('Error:', e.message));
