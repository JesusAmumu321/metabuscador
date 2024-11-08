import requests
from bs4 import BeautifulSoup

def scrape_amazon_price(url):
  """
  This function attempts to extract the price from an Amazon product page URL.
  """
  try:
    response = requests.get(url)
    response.raise_for_status()  # Raise an error for non-200 status codes
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Identify the element containing the price (replace with actual selector)
    price_element = soup.find(id="priceblock_ourprice")
    
    if price_element:
      price = price_element.text.strip()
      return price
    else:
      return "Price not found"
  except requests.exceptions.RequestException as e:
    print(f"Error scraping price for {url}: {e}")
    return None