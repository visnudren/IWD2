import fs from 'fs';
import csv from 'csv-parser';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateIntakeData() {
  try {
    const studentIntakes = new Map();
    
    // Read and parse CSV to get intake data
    const csvData = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream('./attached_assets/2025-06-06 IWD Assignment1_1755685682593.csv')
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    // Process each row to get student intake mapping
    for (const row of csvData) {
      if (!row.ID || !row.Name || row.ID === 'ID' || !row.Intake) continue;
      
      const studentId = row.ID;
      const intake = row.Intake;
      
      if (!studentIntakes.has(studentId)) {
        studentIntakes.set(studentId, intake);
      }
    }

    console.log(`Found ${studentIntakes.size} unique students with intake data`);

    // Update students with intake information
    for (const [studentId, intake] of studentIntakes) {
      await pool.query(
        'UPDATE students SET intake = $1 WHERE id = $2',
        [intake, studentId]
      );
    }

    console.log('✓ All students updated with intake information');

  } catch (error) {
    console.error('Error updating intake data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

updateIntakeData();