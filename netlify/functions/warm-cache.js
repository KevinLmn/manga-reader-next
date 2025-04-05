const axios = require('axios');

exports.handler = async function (event, context) {
  console.log('Warming up Next.js cache...');
  const BASE_URL = process.env.URL || 'http://localhost:3000';

  try {
    const response = await axios.get(BASE_URL);
    console.log(`Cache warmed successfully: ${response.status}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Cache warmed successfully' }),
    };
  } catch (error) {
    console.error('Error warming cache:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to warm cache' }),
    };
  }
};
