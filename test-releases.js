require('dotenv').config();
const axios = require('axios');

async function test() {
  const baseUrl = process.env.AHA_API_URL + '/products/' + process.env.AHA_PRODUCT_ID;

  console.log('Fetching releases from AHA!...\n');
  const response = await axios.get(baseUrl + '/releases', {
    headers: { 'Authorization': 'Bearer ' + process.env.AHA_API_KEY },
    params: {
      per_page: 50,
      fields: 'id,name,release_date,released'
    }
  });

  console.log('Total releases:', response.data.releases.length);
  console.log('\nRecent/Upcoming Releases:');
  response.data.releases
    .filter(r => !r.released || new Date(r.release_date) > new Date('2024-01-01'))
    .slice(0, 15)
    .forEach(r => {
      const name = (r.name + ' '.repeat(40)).substring(0, 40);
      const date = ((r.release_date || 'TBD') + ' '.repeat(12)).substring(0, 12);
      const status = r.released ? '[Released]' : '[Upcoming]';
      console.log('  ' + name + date + status);
    });
}

test().catch(e => console.log('Error:', e.message));
