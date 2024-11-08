import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Cambia el selector por el id de precio actual de Amazon
    const priceElement = $('#priceblock_ourprice').text().trim() || $('#priceblock_dealprice').text().trim();

    if (priceElement) {
      res.status(200).json({ price: priceElement });
    } else {
      res.status(404).json({ error: 'Price not found' });
    }
  } catch (error) {
    console.error(`Error scraping price: ${error}`);
    res.status(500).json({ error: 'Error fetching the price' });
  }
}
