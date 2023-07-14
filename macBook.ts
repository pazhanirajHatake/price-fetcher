import axios from 'axios';
import { parse } from 'node-html-parser';

interface Product {
  title: string;
  price: string;
  seller: string;
}

async function fetchPriceFromAmazon(keyword: string) {
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

  try {
    const response = await axios.get(url);
    const root = parse(response.data);

    const productElement = root.querySelector('.sg-col-inner .s-result-item')?.querySelector('h2 a');

    if (!productElement) {
      throw new Error('Product not found on Amazon.');
    }

    const title = productElement.text.trim();
    const priceElement = productElement.nextElementSibling?.querySelector('.a-price-whole');
    const price = priceElement ? priceElement.text.trim() : '';
    const sellerElement = productElement.closest('.s-result-item')?.querySelector('.a-color-secondary');
    const seller = sellerElement ? sellerElement.text.trim() : '';

    if (title && price) {
      return {
        title,
        price,
        seller,
      };
    }
  } catch (error) {
    console.error('Error fetching price from Amazon:', error.message);
  }

  return null;
}

async function fetchPriceFromFlipkart(keyword: string) {
  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(keyword)}`;

  try {
    const response = await axios.get(url);
    const root = parse(response.data);

    const productElement = root.querySelector('div._4rR01T');
    const productElementPrice = root.querySelector('div._25b18c');
    const productElementPrice2 = productElementPrice?.querySelector("div:first-child");

    if (!productElement) {
      throw new Error('Product not found on Flipkart.');
    }

    const title = productElement.text.trim();
    const price = productElementPrice2?.text.trim();

    if (title && price) {
      return {
        title,
        price,
        seller: 'Flipkart',
      };
    }

  } catch (error) {
    console.error('Error fetching price from Flipkart:', error.message);
  }

  return null;
}


async function fetchProductDetails(keyword: string) {
  const amazonProduct = await fetchPriceFromAmazon(keyword);
  const flipkartProduct = await fetchPriceFromFlipkart(keyword);

  if (amazonProduct) {
    return amazonProduct;
  }

  if (flipkartProduct) {
    return flipkartProduct;
  }

  return null;
}

const keyword = 'Macbook Air M1';
fetchProductDetails(keyword)
  .then((product) => {
    if (product) {
      console.log('Product:', product);
    } else {
      console.log('Product not found.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });