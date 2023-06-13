const fs = require('fs');
const path = require('path');

function parseFastaFile(filename) {
  const fastaData = fs.readFileSync(filename, 'utf8');
  const sequences = fastaData.split('>');
  sequences.shift(); // Remove o elemento vazio no início

  const speciesMap = new Map();

  for (const sequence of sequences) {
    const lines = sequence.split('\n');
    const header = lines[0].trim();
    const species = header.split('|')[1]; // Extrai o nome da espécie
    const sequenceData = lines.slice(1).join('').trim();

    if (speciesMap.has(species)) {
      speciesMap.get(species).push(`>${header}\n${sequenceData}`);
    } else {
      speciesMap.set(species, [`>${header}\n${sequenceData}`]);
    }
  }

  return speciesMap;
}

function writeFastaFiles(speciesMap, outputFolderPath) {
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }

  for (const [species, sequences] of speciesMap) {
    const filename = path.join(outputFolderPath, `${species}.fasta`);
    const fastaContent = sequences.join('\n');
    fs.writeFileSync(filename, fastaContent);
    console.log(`Arquivo ${filename} gerado com sucesso.`);
  }
}

// Utilização
const inputFolderPath = '/home/organa/Desktop/franklin/script_js/script2/Orthogroup_Sequences'; // Substitua pelo caminho da sua pasta de entrada
const outputFolderPath = '/home/organa/Desktop/franklin/script_js/script2/output_script'; // Substitua pelo caminho da sua pasta de saída

fs.readdir(inputFolderPath, (err, files) => {
  if (err) {
    console.error('Erro ao ler a pasta de entrada:', err);
    return;
  }

  const fastaFiles = files.filter(file => path.extname(file) === '.fa');

  const speciesMap = new Map();

  fastaFiles.forEach(file => {
    const filePath = path.join(inputFolderPath, file);
    const fileSpeciesMap = parseFastaFile(filePath);

    for (const [species, sequences] of fileSpeciesMap) {
      if (speciesMap.has(species)) {
        speciesMap.get(species).push(...sequences);
      } else {
        speciesMap.set(species, sequences);
      }
    }
  });

  writeFastaFiles(speciesMap, outputFolderPath);
});

