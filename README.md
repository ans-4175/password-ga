# Password GA

## Quick Start

_If you want to contribute to this project, please fork this repository._

```
cd password-ga
git checkout main
yarn
yarn start
```

Open at `localhost:3000`

Look for files in

- `src/App.js`
- `libs/password-ga.js`

## Scraping words

To populate the list of words, we are using a scraper on http://kateglo.com. The scraper script can be found here: [./scripts/scraper.js](./scripts/scraper.js). To run the scraper, do this in the root project:

```shell
node scripts/scraper.js
```

## Contributing

If you would like to help us with this project you can learn about our initiative from [twitter](https://twitter.com/ans4175/status/1457313278015639553?s=20). Before you contribute to this project, please make sure to read our [CONTRIBUTING](CONTRIBUTING.md) file.

## Tech behind this app

You can learn more about tech stacks that we used by visiting their documentations.

- [React](https://reactjs.org/)
- [Wired](https://wiredjs.com/)
- [React Copy to Clipboard](https://github.com/nkbt/react-copy-to-clipboard)
