const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs/promises');
const path = require('path');

const NOUNS_BASE_URL = 'https://kbbi.kata.web.id/kelas-kata/kata-benda';
const ADJECTIVES_BASE_URL = 'https://kbbi.kata.web.id/kelas-kata/kata-sifat';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Scrape nouns.
  // `Set` is used because it guarantees uniqueness (whereas a normal Array doesn't).
  const nouns = new Set();
  await page.goto(NOUNS_BASE_URL);

  const lastNounPageNumber = await getNumberOfLastPage(page);
  const nounPageNumbers = getFetchedPageNumbers(lastNounPageNumber);

  for (const pageNumber of nounPageNumbers) {
    console.info(`[info] scraping noun page ${pageNumber}...`);

    await page.goto(`${NOUNS_BASE_URL}/page/${pageNumber}`);
    const pageNouns = await getWordsFromPage(page);

    for (const word of pageNouns) {
      nouns.add(word);
    }
  }

  // Scrape adjectives.
  // `Set` is used because it guarantees uniqueness (whereas a normal Array doesn't).
  const adjectives = new Set();
  await page.goto(ADJECTIVES_BASE_URL);

  const lastAdjectivePageNumber = await getNumberOfLastPage(page);
  const adjectivePageNumbers = getFetchedPageNumbers(lastAdjectivePageNumber);

  for (const pageNumber of adjectivePageNumbers) {
    console.info(`[info] scraping adjective page ${pageNumber}...`);

    await page.goto(`${ADJECTIVES_BASE_URL}/page/${pageNumber}`);
    const pageAdjectives = await getWordsFromPage(page);

    for (const word of pageAdjectives) {
      adjectives.add(word);
    }
  }

  // Save to local JSON file.
  await fs.writeFile(path.join(__dirname, '../src/words.json'), {
    nouns: Array.from(nouns),
    adjectives: Array.from(adjectives)
  });
  await browser.close();
})();

// Helper functions.
async function getWordsFromPage(page) {
  const data = await page.evaluate(() => document.querySelector('*').outerHTML);

  const $ = cheerio.load(data);
  const words = [];

  $('dl > dt > a').each((_idx, element) => {
    const word = cheerio.load(element.children[0]).text();
    // Clear parentheses (if any).
    // TODO(imballinst): check if we want to remove symbols such as hyphen as well.
    words.push(word.toLowerCase().replace(/[()]+/g, ''));
  });

  return words;
}

async function getNumberOfLastPage(page) {
  const data = await page.evaluate(() => document.querySelector('*').outerHTML);
  const $ = cheerio.load(data);

  const lastPage = $('div.pagination > a.page-numbers:not(.next)')
    .last()
    .text();
  return Number(lastPage.replace(',', ''));
}

// At the moment, we settle for ~500 words.
// Reference: https://github.com/ans-4175/password-ga/issues/9#issuecomment-964749676.
const NUMBER_OF_FETCHED_PAGES = 5;

/**
 * Get the page numbers that will to be fetched.
 * @param {number} lastPageNumber last page number
 * @returns {number[]} array of page numbers
 */
function getFetchedPageNumbers(lastPageNumber) {
  // Create an array with size `lastPageNumber`, with the
  // first array element being 1 and the last array element being `lastPageNumber`.
  const pages = Array.from(new Array(lastPageNumber)).map(
    (_el, idx) => idx + 1
  );
  const fetchedPageNumbers = [];

  while (fetchedPageNumbers.length < NUMBER_OF_FETCHED_PAGES) {
    // Get the array index.
    // We will use it to get the page number and to splice the array.
    const pageArrayIdx = Math.floor(Math.random() * pages.length);
    const pageNumber = pages[pageArrayIdx];

    fetchedPageNumbers.push(pageNumber);
    pages.splice(pageArrayIdx, 1);
  }

  return fetchedPageNumbers;
}
