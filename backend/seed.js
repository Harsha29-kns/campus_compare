"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Start seeding...');
    const csvPath = path_1.default.join(__dirname, '../imp.csv');
    const fileContent = fs_1.default.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Skip header
    const dataLines = lines.slice(1);
    for (const line of dataLines) {
        // Basic CSV split by comma (assuming no commas inside fields in this simple dataset)
        const columns = line.split(',');
        if (columns.length < 19)
            continue;
        const [name, location, state, yearStr, type, mode, course, durationStr, feesStr, entranceExam, cutoffStr, avgPlacemntStr, highPkgStr, avgPkgStr, livingCostStr, hostelStr, facultyRatioStr, rankingStr, source] = columns;
        await prisma.college.create({
            data: {
                name,
                location,
                state,
                yearEstablished: parseInt(yearStr) || null,
                type: type || null,
                mode: mode || null,
                course: course || null,
                durationYears: parseInt(durationStr) || null,
                feesPerYear: parseFloat(feesStr) || null,
                entranceExam: entranceExam || null,
                cutoffRank: parseInt(cutoffStr) || null,
                averagePlacementPct: parseFloat(avgPlacemntStr) || null,
                highestPackageLpa: parseFloat(highPkgStr) || null,
                averagePackageLpa: parseFloat(avgPkgStr) || null,
                livingCostPerMonth: parseFloat(livingCostStr) || null,
                hostelAvailability: hostelStr?.toLowerCase() === 'yes',
                studentFacultyRatio: parseInt(facultyRatioStr) || null,
                ranking: parseInt(rankingStr) || null,
                source: source || null
            }
        });
    }
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
