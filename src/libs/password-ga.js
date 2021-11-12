import {
  pickNRandom,
  pickOneRandom,
  getMinMax,
  mutate,
  mutationCases,
  mutationLetters,
  mutationSymbols
} from './common';

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
