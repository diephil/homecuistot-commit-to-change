import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SECTION_PATTERN = /^#\s+[A-Z]\s+[A-Z\s\d-]+S\s+E\s+C\s+T\s+I\s+O\s+N/
const SECTION_NAME_MAP: Record<string, string> = {
  'N O N - C L A S S I F I E D': 'non_classified',
  'E 1 0 0   -   E 1 9 9': 'e100_e199',
  'F E R M E N T S': 'ferments',
  'D A I R Y': 'dairy',
  'C H E E S E S': 'cheeses',
  'S A L T': 'salt',
  'M E A T': 'meat',
  'S T A R C H': 'starch',
  'O I L S   A N D   F A T S': 'oils_and_fats',
  'A L C O H O L': 'alcohol',
  'A R O M A': 'aroma',
  'C E R E A L': 'cereal',
  'C O C O A': 'cocoa',
  'W A T E R': 'water',
  'F R U I T': 'fruit',
  'V E G E T A B L E S': 'vegetables',
  'B E A N S': 'beans',
  'N U T S': 'nuts',
  'S E E D': 'seed',
  'P L A N T S': 'plants',
  'M U S H R O O M': 'mushroom',
  'F I S H': 'fish',
  'M O L L U S C S': 'molluscs',
  'C R U S T A C E A N S': 'crustaceans',
  'B E E   I N G R E D I E N T S': 'bee_ingredients',
  'S Y N T H E S I Z E D': 'synthesized',
  'P O U L T R Y': 'poultry',
  'E G G S': 'eggs',
  'P A R T S': 'parts',
  'C O M P O U N D       I N G R E D I E N T S': 'compound_ingredients',
}

interface Ingredient {
  name: string
  category: string
}

function extractSectionName(line: string): string | null {
  for (const [spaced, normalized] of Object.entries(SECTION_NAME_MAP)) {
    if (line.includes(spaced)) {
      return normalized
    }
  }
  return null
}

async function extractIngredients(params: {
  inputPath: string
  langCode: string
}): Promise<Ingredient[]> {
  const { inputPath, langCode } = params
  const ingredients: Ingredient[] = []
  let currentCategory = 'non_classified'

  const fileStream = fs.createReadStream(inputPath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  const langPrefix = `${langCode}:`

  for await (const line of rl) {
    const trimmed = line.trim()

    // Check for section header
    if (SECTION_PATTERN.test(trimmed)) {
      const sectionName = extractSectionName(trimmed)
      if (sectionName) {
        currentCategory = sectionName
      }
      continue
    }

    // Skip comments, empty lines, hierarchy markers, properties
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('<') ||
      trimmed.startsWith('synonyms:') ||
      trimmed.startsWith('stopwords:') ||
      trimmed.includes(':en:') || // properties like wikidata:en:
      trimmed === ''
    ) {
      continue
    }

    // Check for language-specific ingredient line
    if (trimmed.startsWith(langPrefix)) {
      const namesStr = trimmed.slice(langPrefix.length).trim()
      // Split by comma and clean up each name
      const names = namesStr
        .split(',')
        .map((n) => n.trim())
        .filter((n) => n.length > 0)

      for (const name of names) {
        ingredients.push({ name, category: currentCategory })
      }
    }
  }

  return ingredients
}

function writeCsv(params: { ingredients: Ingredient[]; outputPath: string }) {
  const { ingredients, outputPath } = params
  const header = 'name,category\n'
  const rows = ingredients
    .map((i) => `"${i.name.replace(/"/g, '""')}",${i.category}`)
    .join('\n')

  fs.writeFileSync(outputPath, header + rows, 'utf-8')
}

async function main() {
  const langCode = process.argv[2] || 'en'
  const scriptDir = __dirname
  const appDir = path.dirname(scriptDir) // apps/nextjs/
  const repoRoot = path.dirname(path.dirname(appDir)) // repo root
  const researchDir = path.join(repoRoot, 'research')

  const inputPath = path.join(researchDir, 'food-ingredient-taxonomy-openfoodfacts.txt')
  const outputPath = path.join(researchDir, `${langCode}-ingredient-names.csv`)

  console.log(`Extracting ${langCode} ingredients from taxonomy...`)

  const ingredients = await extractIngredients({ inputPath, langCode })

  console.log(`Found ${ingredients.length} ingredient names`)

  writeCsv({ ingredients, outputPath })

  console.log(`Written to ${outputPath}`)

  // Print category breakdown
  const byCat: Record<string, number> = {}
  for (const i of ingredients) {
    byCat[i.category] = (byCat[i.category] || 0) + 1
  }
  console.log('\nCategory breakdown:')
  for (const [cat, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`)
  }
}

main().catch(console.error)
