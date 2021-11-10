const charset = 'abcdefghijklmnopqrstuvwxyz';
const consonantset = 'bcdfghjklmnpqrstvwxyz';
const vocalset = 'aiueo';

const VOCAL_TYPE = 'vocal';
const CONSONANT_TYPE = 'const';
const NUM_TYPE = 'num';

const MUTATE_THRESHOLD_LETTERS = 0.9696;
const MUTATE_THRESHOLD_SYMBOLS = 0.9696;
const MUTATE_THRESHOLD_CASES = 0.8686;
const GENERATION_THRESHOLD_FITNESS = 0;

const checkGeneType = (char) => {
  if (vocalset.includes(char)) return VOCAL_TYPE;
  else if (consonantset.includes(char)) return CONSONANT_TYPE;
  else return NUM_TYPE;
};

const pickOneRandom = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

function pickNRandom(arr, n) {
  let result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available');
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

const generateChromosome = (chromLength) => {
  return [...Array(chromLength)]
    .map((_) => charset[Math.floor(Math.random() * charset.length)])
    .join('');
};

const checkFitnessScore = (chromosome) => {
  //  rule1: consonant or vocal cannot be in double occurences sequentially
  //  rule2: if upperCases exist then plus score
  //  rule3: if numbers exist then plus score
  //  rule4: if symbols exist then plus score
  let score = 10 * chromosome.length; // baseScoreline
  let lastGeneType = '';
  let lastGeneSeqCount = 1;

  let isUpperExist = false;
  let isNumberExist = false;
  let isSymbolExist = false;

  const symbolFormat = '!@#$%^&*()_+{}|[]=-;:,./<>?';

  chromosome.split('').forEach((gene) => {
    // rule 1
    if (checkGeneType(gene) === lastGeneType) ++lastGeneSeqCount;
    if (lastGeneSeqCount > 1) {
      score = score - 10;
      lastGeneSeqCount = 1;
    }
    lastGeneType = checkGeneType(gene);
    // rule 2
    if (
      gene === gene.toUpperCase() &&
      !(gene >= '0' && gene <= '9') &&
      gene >= 'A' &&
      gene <= 'Z'
    )
      isUpperExist = true;
    // rule 3
    if (gene === gene.toUpperCase() && gene >= '0' && gene <= '9')
      isNumberExist = true;
    // rule 4
    if (gene === gene.toUpperCase() && symbolFormat.includes(gene))
      isSymbolExist = true;
  });

  if (isUpperExist) score += 10;
  if (isNumberExist) score += 10;
  if (isSymbolExist) score += 10;

  // console.log(chromosome, score);
  return score;
};

const mutate = (chromosome, threshold, mutateFunction) => {
  return chromosome
    .split('')
    .map((gene) => {
      return Math.random() < threshold
        ? mutateFunction(gene, false)
        : mutateFunction(gene, true);
    })
    .join('');
};

const mutationCases = (gene, condition = true) => {
  if (condition) {
    return gene.toUpperCase();
  } else {
    return gene.toLowerCase();
  }
};

const mutationLetters = (gene, condition = true) => {
  if (condition) {
    switch (gene.toLowerCase()) {
      case 'i':
        return '1';
      case 'r':
        return '2';
      case 'e':
        return '3';
      case 'a':
        return '4';
      case 's':
        return '5';
      case 'g':
        return '6';
      case 'z':
        return '7';
      case 'b':
        return '8';
      case 'q':
        return '9';
      default:
        return gene;
    }
  } else {
    return gene;
  }
};

const mutationSymbols = (gene, condition = true) => {
  if (condition) {
    switch (gene.toLowerCase()) {
      case 'i':
        return '!';
      case 'a':
        return '@';
      case 's':
        return '$';
      case 'o':
        return '*';
      case 'p':
        return '?';
      default:
        return gene;
    }
  } else {
    return gene;
  }
};

const geneticProcess = (firstGenes, secondGenes) => {
  // breed new crossover
  const randXOver = Math.ceil(Math.random() * firstGenes.length);
  const firstHalfFront = firstGenes.slice(0, randXOver);
  const firstHalfLast = firstGenes.slice(randXOver, firstGenes.length);
  const secondHalfFront = secondGenes.slice(0, randXOver);
  const secondHalfLast = secondGenes.slice(randXOver, secondGenes.length);

  let firstXOver = [...firstHalfFront, ...secondHalfLast].join('');
  let secondXOver = [...secondHalfFront, ...firstHalfLast].join('');

  // mutate letters to numbers
  firstXOver = mutate(firstXOver, MUTATE_THRESHOLD_LETTERS, mutationLetters);
  secondXOver = mutate(secondXOver, MUTATE_THRESHOLD_LETTERS, mutationLetters);
  // mutate cases
  firstXOver = mutate(firstXOver, MUTATE_THRESHOLD_CASES, mutationCases);
  secondXOver = mutate(secondXOver, MUTATE_THRESHOLD_CASES, mutationCases);
  // mutate symbols
  firstXOver = mutate(firstXOver, MUTATE_THRESHOLD_SYMBOLS, mutationSymbols);
  secondXOver = mutate(secondXOver, MUTATE_THRESHOLD_SYMBOLS, mutationSymbols);

  if (checkFitnessScore(firstXOver) > checkFitnessScore(secondXOver))
    return firstXOver;
  else return secondXOver;
};

const survivalFittest = (population, maxPopulation) => {
  return population
    .sort((a, b) => {
      return checkFitnessScore(b) - checkFitnessScore(a);
    })
    .slice(0, maxPopulation);
};

const getMinMax = (arr) => {
  let min = arr[0];
  let max = arr[0];
  let i = arr.length;

  while (i--) {
    min = arr[i] < min ? arr[i] : min;
    max = arr[i] > max ? arr[i] : max;
  }
  return { min, max };
};

const generatePasswords = ({
  chromosomeLength = 12,
  maxPopulation = 33,
  stayGen = 3,
  pickCount = 1
}) => {
  // logic password generator, by genetic programming
  // initialize population by random chars
  let population = [...Array(maxPopulation)].map((_) =>
    generateChromosome(chromosomeLength)
  );
  population = survivalFittest(population);
  // let currGeneration = 1;
  let strongGeneration = 0;
  let nextGen = true;
  while (nextGen) {
    // prepare population to be mated
    const half = Math.ceil(population.length / 2);
    const firstHalf = population.slice(0, half);
    const secondHalf = population.slice(-half);
    // breeding new
    const newPopulation = [];
    firstHalf.forEach((candidate) => {
      newPopulation.push(geneticProcess(candidate, pickOneRandom(secondHalf)));
    });
    population = [...population, ...newPopulation];
    // sort by fitness score
    population = survivalFittest(population, maxPopulation);

    // check generation convergence
    const { min, max } = getMinMax(
      population.map((chrom) => checkFitnessScore(chrom))
    );
    if (max - min <= GENERATION_THRESHOLD_FITNESS) {
      strongGeneration++;
      if (strongGeneration > stayGen) nextGen = false;
    } else {
      strongGeneration = 0;
    }
    // currGeneration++;
  }
  // pick population
  return pickNRandom(population, pickCount);
};

// module.exports = generatePasswords;
export default generatePasswords;
