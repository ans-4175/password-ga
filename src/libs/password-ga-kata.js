const KATA_BENDA = [
  'hotel',
  'rumah',
  'makam',
  'botol',
  'pisau',
  'kerbau',
  'meja',
  'telepon',
  'motor',
  'gitar',
  'pintu',
  'kasur'
];
const KATA_SIFAT = [
  'panas',
  'dingin',
  'hebat',
  'bersih',
  'sehat',
  'mantap',
  'jagoan',
  'sakti',
  'gila',
  'nikmat',
  'lemah',
  'kuat'
];

const MUTATE_THRESHOLD_LETTERS = 0.9696;
const MUTATE_THRESHOLD_SYMBOLS = 0.9696;
const MUTATE_THRESHOLD_CASES = 0.8686;
const GENERATION_THRESHOLD_FITNESS = 0;

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
  return pickNRandom(population, pickCount).map((chrom) => chrom.join(''));
};

// module.exports = generatePasswords;
export default generatePasswords;
