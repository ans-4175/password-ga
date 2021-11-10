const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs/promises");

const NOUNS_BASE_URL = "https://kbbi.kata.web.id/kelas-kata/kata-benda";
const ADJECTIVES_BASE_URL = "https://kbbi.kata.web.id/kelas-kata/kata-sifat";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Scrape nouns.
  // `Set` is used because it guarantees uniqueness (whereas a normal Array doesn't).
  const nouns = new Set();
  await page.goto(NOUNS_BASE_URL);

  const lastNounPageNumber = await getNumberOfLastPage(page);
  const nounPageNumbers = getFetchedPageNumbers(lastNounPageNumber);
  console.log(lastNounPageNumber, nounPageNumbers);
  for (const pageNumber of nounPageNumbers) {
    info(`noun page ${pageNumber}`);

    await page.goto(`${NOUNS_BASE_URL}/page/${pageNumber}`);
    const pageNouns = await getWordsFromPage(page);

    for (const word of pageNouns) {
      nouns.add(word);
    }
  }

  // Scrape adjectives.
  // `Set` is used because it guarantees uniqueness (whereas a normal Array doesn't).
  const adjectives = new Set();
  await page.goto(NOUNS_BASE_URL);

  const lastAdjectivePageNumber = await getNumberOfLastPage(page);
  const adjectivePageNumbers = getFetchedPageNumbers(lastAdjectivePageNumber);

  for (const pageNumber of adjectivePageNumbers) {
    info(`adjective page ${pageNumber}`);

    await page.goto(`${ADJECTIVES_BASE_URL}/page/${pageNumber}`);
    const pageAdjectives = await getWordsFromPage(page);

    for (const word of pageAdjectives) {
      adjectives.add(word);
    }
  }

  console.log({
    nouns: Array.from(nouns),
    adjectives: Array.from(adjectives),
  });

  await browser.close();
})();

// Helper functions.
async function getWordsFromPage(page) {
  const data = await page.evaluate(() => document.querySelector("*").outerHTML);

  const $ = cheerio.load(data);
  const words = [];

  $("dl > dt > a").each((_idx, element) => {
    const word = cheerio.load(element.children[0]).text();
    // Clear parentheses (if any).
    // TODO(imballinst): check if we want to remove symbols such as hyphen as well.
    words.push(word.replace(/[()]+/g, ""));
  });

  return words;
}

async function getNumberOfLastPage(page) {
  const data = await page.evaluate(() => document.querySelector("*").outerHTML);
  const $ = cheerio.load(data);

  const lastPage = $("div.pagination > a.page-numbers:not(.next)")
    .last()
    .text();
  return Number(lastPage.replace(",", ""));
}

// At the moment, we settle for ~500 words.
// Reference: https://github.com/ans-4175/password-ga/issues/9#issuecomment-964749676.
const NUMBER_OF_FETCHED_PAGES = 50;

/**
 * Get the page numbers that will to be fetched.
 * In the scraped website, each page contains ~10 words.
 * @param {number} lastPageNumber last page number
 * @returns {number[]} array of page numbers
 */
function getFetchedPageNumbers(lastPageNumber) {
  const pages = Array.from(new Array(lastPageNumber)).map(
    (_el, idx) => idx + 1
  );
  const fetchedPageNumbers = [];

  while (fetchedPageNumbers.length < NUMBER_OF_FETCHED_PAGES) {
    const pageIndex = Math.floor(Math.random() * pages.length + 1);
    const pageNumber = pages[pageIndex];

    fetchedPageNumbers.push(pageNumber);
    pages.splice(pageIndex, 1);
  }

  return fetchedPageNumbers;
}

// A simple logger function.
function info(message) {
  console.info(`[info] scraping ${message}...`);
}
