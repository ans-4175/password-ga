export const mutate = (chromosome, threshold, mutateFunction) => {
  return chromosome
    .split('')
    .map((gene) => {
      return Math.random() < threshold
        ? mutateFunction(gene, false)
        : mutateFunction(gene, true);
    })
    .join('');
};

export const mutationCases = (gene, condition = true) => {
  if (condition) {
    return gene.toUpperCase();
  } else {
    return gene.toLowerCase();
  }
};

// Number mutations.
const LETTER_TO_NUMBER_MUTATIONS = {
  i: 1,
  r: 2,
  e: 3,
  a: 4,
  s: 5,
  g: 6,
  z: 7,
  b: 8,
  q: 9
};

export const mutationLetters = (gene, condition = true) => {
  if (condition) {
    const lowercased = gene.toLowerCase();
    const mutated = LETTER_TO_NUMBER_MUTATIONS[lowercased];

    if (mutated !== undefined) {
      return mutated;
    }
  }

  return gene;
};

// Symbol mutations.
const LETTER_TO_SYMBOL_MUTATIONS = {
  i: '!',
  a: '@',
  s: '$',
  o: '*',
  p: '?'
};

export const mutationSymbols = (gene, condition = true) => {
  if (condition) {
    const lowercased = gene.toLowerCase();
    const mutated = LETTER_TO_SYMBOL_MUTATIONS[lowercased];

    if (mutated !== undefined) {
      return mutated;
    }
  }

  return gene;
};

const NUMBER_TO_LETTER_DEMUTATIONS = createDemutationDictionary(
  LETTER_TO_NUMBER_MUTATIONS
);
const SYMBOL_TO_LETTER_DEMUTATIONS = createDemutationDictionary(
  LETTER_TO_SYMBOL_MUTATIONS
);

export const demutatePassword = (chromosome) => {
  const demutated = chromosome.split('').map((gene) => {
    const lowercased = gene.toLowerCase();

    // Try demutate number. Return early if successful.
    const demutatedNumber = NUMBER_TO_LETTER_DEMUTATIONS[lowercased];

    if (demutatedNumber !== undefined) {
      return demutatedNumber;
    }

    // Try demutate symbol. Return early if successful.
    const demutatedSymbol = SYMBOL_TO_LETTER_DEMUTATIONS[lowercased];

    if (demutatedSymbol !== undefined) {
      return demutatedSymbol;
    }

    // Keep the gene as-is.
    return gene;
  });

  return demutated.join('');
};

// Helper functions.

/**
 * This function receives an object of mutation (letter-number/letter-symbol), and re-mapped them
 * to an object of demutation (number-letter/symbol-letter).
 *
 * This is possible because we always use letters by default (and not a mix of letters and numbers).
 * As such, it will be possible to make a mixed password to be "pronounciable".
 * @param {Object} obj
 */
function createDemutationDictionary(obj) {
  const demutated = {};

  for (const key in obj) {
    const mutated = obj[key];
    demutated[mutated] = key;
  }

  return demutated;
}
