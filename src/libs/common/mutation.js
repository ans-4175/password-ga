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
