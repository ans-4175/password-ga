const charset = "abcdefghijklmnopqrstuvwxyz";
const consonantset = "bcdfghjklmnpqrstvwxyz";
const vocalset = "aiueo";

const VOCAL_TYPE = "vocal";
const CONSONANT_TYPE = "const";
const NUM_TYPE = "num";

const MUTATE_THRESHOLD_LETTERS = 0.9696;
const MUTATE_THRESHOLD_CASES = 0.8686;

const checkGeneType = (char) => {
    if (vocalset.includes(char))
        return VOCAL_TYPE;
    else if (consonantset.includes(char))
        return CONSONANT_TYPE;
    else
        return NUM_TYPE;
}

const pickOneRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickNRandom(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
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
              .join("");
}

const checkFitnessScore = (chromosome) => {
    //  rule1: consonant or vocal cannot be in double occurences sequentially
    let score = 10 * chromosome.length;
    let lastGeneType = "";
    let lastGeneSeqCount = 1;

    chromosome.split("").forEach(gene => {
        if (checkGeneType(gene) === lastGeneType) ++lastGeneSeqCount;
        // console.log(gene, lastGeneType, lastGeneSeqCount);
        if (lastGeneSeqCount > 1) {
            score = score - 10;
            lastGeneSeqCount = 1;
        }
        lastGeneType = checkGeneType(gene);
    });

    return score;
}

const mutateCases = (chromosome) => {
    return chromosome.split("").map(gene => {
        return (Math.random() < MUTATE_THRESHOLD_CASES ? gene.toLowerCase() : gene.toUpperCase());
    }).join("");
}

const mutationLetters = (gene) => {
    switch (gene.toLowerCase()) {
        case "i":
            return "1";
        case "r":
            return "2"
        case "e":
            return "3"
        case "a":
            return "4"
        case "s":
            return "5"
        case "g":
            return "6"
        case "z":
            return "7"
        case "b":
            return "8"
        case "q":
            return "9"
        default:
            return gene
    }
}

const mutateLetters = (chromosome) => {
    return chromosome.split("").map(gene => {
        return (Math.random() < MUTATE_THRESHOLD_LETTERS ? gene : mutationLetters(gene));
    }).join("");
}

const geneticProcess = (firstGenes, secondGenes) => {
    // breed new crossover
    const randXOver = Math.ceil(Math.random() * firstGenes.length);
    const firstHalfFront = firstGenes.slice(0, randXOver);
    const firstHalfLast = firstGenes.slice(randXOver, firstGenes.length);
    const secondHalfFront = secondGenes.slice(0, randXOver);
    const secondHalfLast = secondGenes.slice(randXOver, secondGenes.length);

    let firstXOver = [...firstHalfFront, ...secondHalfLast].join("");
    let secondXOver = [...secondHalfFront, ...firstHalfLast].join("");
    
    // mutate letters to numbers
    firstXOver = mutateLetters(firstXOver);
    secondXOver = mutateLetters(secondXOver);
    // mutate cases
    firstXOver = mutateCases(firstXOver);
    secondXOver = mutateCases(secondXOver);

    if (checkFitnessScore(firstXOver) > checkFitnessScore(secondXOver))
        return firstXOver
    else
        return secondXOver;
}

const survivalFittest = (population, maxPopulation) => {
    return population.sort((a,b) => {
        return checkFitnessScore(b) - checkFitnessScore(a);
    }).slice(0, maxPopulation);
}

const generatePasswords = ({
        chromosomeLength = 12, maxPopulation = 33,
        generations = 20, pickCount = 1
    }) => {

    // logic password generator, by genetic programming
    // initialize population by random chars
    let population = [...Array(maxPopulation)].map((_) => generateChromosome(chromosomeLength));
    population = survivalFittest(population);
    let currGeneration = 0;
    while (currGeneration <= generations) {
        // prepare population to be mated
        const half = Math.ceil(population.length / 2);
        const firstHalf = population.slice(0, half);
        const secondHalf = population.slice(-half);
        // breeding new
        const newPopulation = []
        firstHalf.forEach(candidate => {
            newPopulation.push(geneticProcess(candidate, pickOneRandom(secondHalf)));
        });
        population = [...population, ...newPopulation];
        // sort by fitness score
        population = survivalFittest(population, maxPopulation);

        currGeneration++;
    }
    // pick population
    return pickNRandom(population, pickCount);
}

export default generatePasswords;