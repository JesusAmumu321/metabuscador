import axios from 'axios';

export default async function handler(req, res) {
  const { query, start = 1 } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&start=${start}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching search results' });
  }
}