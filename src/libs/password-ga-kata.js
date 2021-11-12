import { pickNRandom, pickOneRandom } from './array-common';
import {
  getMinMax,
  mutate,
  mutationCases,
  mutationLetters,
  mutationSymbols
} from './mutation-common';

import WORDS_JSON from '../words.json';

const KATA_BENDA = WORDS_JSON.nouns;
const KATA_SIFAT = WORDS_JSON.adjectives;

const MUTATE_THRESHOLD_LETTERS = 0.9696;
const MUTATE_THRESHOLD_SYMBOLS = 0.9696;
const MUTATE_THRESHOLD_CASES = 0.8686;
const GENERATION_THRESHOLD_FITNESS = 0;

// ===IMPLEMENTED FUNCTION

const generateChromosome = () => {
  return [pickOneRandom(KATA_BENDA), pickOneRandom(KATA_SIFAT)];
  // hacky things since chromosome should be in string, but can't use it on XOver
};

const checkFitnessScore = (chromosome) => {
  //  rule1: panjang chromosome kalau 10-12 score tinggi
  //  rule2: if upperCases exist then plus score
  //  rule3: if numbers exist then plus score
  //  rule4: if symbols exist then plus score
  const symbolFormat = '!@#$%^&*()_+{}|[]=-;:,./<>?';
  let score = 100; // baseScoreline

  let isLengthIdeal = false;
  let isUpperExist = false;
  let isNumberExist = false;
  let isSymbolExist = false;

  // rule 1
  if (chromosome.length >= 10 && chromosome.length <= 12) isLengthIdeal = true;

  chromosome.split('').forEach((gene) => {
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

  if (isLengthIdeal) score += 20;
  if (isUpperExist) score += 10;
  if (isNumberExist) score += 10;
  if (isSymbolExist) score += 10;

  // console.log(chromosome, score);
  return score;
};

const survivalFittest = (population, maxPopulation) => {
  return population
    .sort((a, b) => {
      return checkFitnessScore(b.join('')) - checkFitnessScore(a.join(''));
    })
    .slice(0, maxPopulation);
};

const geneticProcess = (firstGenes, secondGenes) => {
  // breed new crossover
  const firstHalfFront = firstGenes[0];
  const firstHalfLast = firstGenes[1];
  const secondHalfFront = secondGenes[0];
  const secondHalfLast = secondGenes[1];

  let firstXOver = [firstHalfFront, secondHalfLast];
  let secondXOver = [secondHalfFront, firstHalfLast];

  firstXOver = firstXOver.map((splitGene) => {
    let mutatedGene = splitGene;
    mutatedGene = mutate(
      mutatedGene,
      MUTATE_THRESHOLD_LETTERS,
      mutationLetters
    );
    mutatedGene = mutate(mutatedGene, MUTATE_THRESHOLD_CASES, mutationCases);
    mutatedGene = mutate(
      mutatedGene,
      MUTATE_THRESHOLD_SYMBOLS,
      mutationSymbols
    );

    return mutatedGene;
  });
  secondXOver = secondXOver.map((splitGene) => {
    let mutatedGene = splitGene;
    mutatedGene = mutate(
      mutatedGene,
      MUTATE_THRESHOLD_LETTERS,
      mutationLetters
    );
    mutatedGene = mutate(mutatedGene, MUTATE_THRESHOLD_CASES, mutationCases);
    mutatedGene = mutate(
      mutatedGene,
      MUTATE_THRESHOLD_SYMBOLS,
      mutationSymbols
    );

    return mutatedGene;
  });

  if (
    checkFitnessScore(firstXOver.join('')) >
    checkFitnessScore(secondXOver.join(''))
  )
    return firstXOver;
  else return secondXOver;
};

const generatePasswords = ({
  chromosomeLength = 12,
  maxPopulation = 33,
  stayGen = 3,
  pickCount = 1
}) => {
  // logic password generator, by genetic programming
  // initialize population by random chars
  let population = [...Array(maxPopulation)].map((_) => generateChromosome());
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
      population.map((chrom) => checkFitnessScore(chrom.join('')))
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
  return pickNRandom(population, pickCount).flat();
};

// module.exports = generatePasswords;
export default generatePasswords;
