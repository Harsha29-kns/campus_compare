import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Approximate coordinates for major Indian cities
const cityCoordinates: Record<string, { lat: number, lng: number }> = {
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Kharagpur': { lat: 22.3302, lng: 87.3237 },
  'Pilani': { lat: 28.3611, lng: 75.6022 },
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'Vellore': { lat: 12.9165, lng: 79.1325 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Roorkee': { lat: 29.8543, lng: 77.8880 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Manipal': { lat: 13.3409, lng: 74.7858 },
  'Mangalore': { lat: 12.9141, lng: 74.8560 },
  'Gautam Buddha Nagar': { lat: 28.3670, lng: 77.5405 },
  'Warangal': { lat: 17.9818, lng: 79.5298 },
  'Patiala': { lat: 30.3398, lng: 76.3869 },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'Gandhinagar': { lat: 23.2156, lng: 72.6369 },
  'Jodhpur': { lat: 26.2389, lng: 73.0243 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Rupnagar': { lat: 30.9666, lng: 76.5333 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Mandi': { lat: 31.5892, lng: 76.9320 },
  'Dhanbad': { lat: 23.7957, lng: 86.4304 },
  'Calicut': { lat: 11.2588, lng: 75.7804 },
  'Surathkal': { lat: 13.0044, lng: 74.7936 },
  'Allahabad': { lat: 25.4358, lng: 81.8463 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Kolhapur': { lat: 16.7050, lng: 74.2433 }
};

async function main() {
  console.log('Start seeding...');
  
  // Clear existing data
  await prisma.answer.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  const csvPath = path.join(__dirname, '../imp.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  // Skip header
  const dataLines = lines.slice(1);

  for (const line of dataLines) {
    // Basic CSV split by comma (assuming no commas inside fields in this simple dataset)
    const columns = line.split(',');
    
    if (columns.length < 19) continue;

    const [
      name, location, state, yearStr, type, mode, course, durationStr, feesStr, 
      entranceExam, cutoffStr, avgPlacemntStr, highPkgStr, avgPkgStr, 
      livingCostStr, hostelStr, facultyRatioStr, rankingStr, source
    ] = columns;

    const coords = cityCoordinates[location] || null;

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
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lng : null,
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
