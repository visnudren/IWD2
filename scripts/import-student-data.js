import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../server/db.ts';
import { students, modules, studentResults } from '../shared/schema.ts';
import { eq, sql } from 'drizzle-orm';

// Grade point mapping based on the CSV legend
const gradePointMap = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
  'XF': 0.0
};

// Status mapping for non-grade entries
const statusMap = {
  'e': 'Exempted',
  'ct': 'Credit Transfer', 
  'n': 'In Progress', // "To Take" maps to "In Progress"
  '1': 'In Progress', // "Retaking" maps to "In Progress"
  'o': 'Completed',
  'x': 'Failed',
  'v': 'Completed',
  '0.5': 'In Progress'
};

// Parse intake to year
function parseIntakeYear(intake) {
  const year = intake.split('-')[1];
  return 2000 + parseInt(year);
}

// Extract first and last name from full name
function parseName(fullName) {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

// Determine programme (we'll assume UEIS = Software Engineering for now)
function getProgramme(programmeCode) {
  return programmeCode === 'UEIS' ? 'Software Engineering' : 'Computer Science';
}

// Extract credits from module code (simplified approach)
function getModuleCredits(moduleCode) {
  // Most modules are 3 credits, but some might be 4
  if (moduleCode.includes('4N') || moduleCode.includes('4')) {
    return 4;
  }
  return 3;
}

// Get semester from module code (simplified)
function getModuleSemester(moduleCode) {
  if (moduleCode.includes('1')) return 1;
  if (moduleCode.includes('2')) return 2;
  if (moduleCode.includes('3')) return 3;
  return 1; // default
}

async function importStudentData() {
  console.log('Starting student data import...');
  
  const studentsData = new Map(); // studentId -> student info
  const modulesData = new Map(); // moduleCode -> module info
  const resultsData = []; // array of student results
  
  // Parse CSV file
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream('attached_assets/2025-06-06 IWD Assignment1_1755681162916.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Skip header rows and empty rows
        if (!row.ID || row.ID === 'ID' || !row.Name || row.Name.includes('Grade')) {
          return;
        }
        
        results.push(row);
      })
      .on('end', async () => {
        console.log(`Parsed ${results.length} rows from CSV`);
        
        // Process each row
        for (const row of results) {
          const studentId = row.ID;
          const fullName = row.Name;
          const intake = row.Intake;
          const moduleCode = row['Subject Code'];
          const moduleName = row['Subject Name'];
          const grade = row.Grade;
          const comment = row.Comment;
          const programmeCode = row.Programme;
          const email = row.Email;
          
          if (!studentId || !fullName) continue;
          
          // Process student data
          if (!studentsData.has(studentId)) {
            const { firstName, lastName } = parseName(fullName);
            const intakeYear = parseIntakeYear(intake);
            const programme = getProgramme(programmeCode);
            
            studentsData.set(studentId, {
              id: studentId,
              firstName,
              lastName,
              email,
              programme,
              intakeYear,
              currentSemester: 1,
              status: 'Active'
            });
          }
          
          // Process module data
          if (moduleCode && moduleName && !modulesData.has(moduleCode)) {
            const credits = getModuleCredits(moduleCode);
            const semester = getModuleSemester(moduleCode);
            const programme = getProgramme(programmeCode);
            
            modulesData.set(moduleCode, {
              code: moduleCode,
              name: moduleName,
              credits,
              semester,
              programme,
              isCore: true
            });
          }
          
          // Process student result data
          if (moduleCode && grade) {
            let resultGrade = null;
            let gradePoint = null;
            let status = 'In Progress';
            
            // Check if it's a letter grade
            if (gradePointMap.hasOwnProperty(grade)) {
              resultGrade = grade;
              gradePoint = gradePointMap[grade];
              status = 'Completed';
            } else if (statusMap.hasOwnProperty(grade)) {
              status = statusMap[grade];
            }
            
            resultsData.push({
              studentId,
              moduleCode,
              semester: getModuleSemester(moduleCode),
              year: parseIntakeYear(intake),
              grade: resultGrade,
              gradePoint,
              status,
              attemptNumber: grade === '1' ? 2 : 1 // Retaking = attempt 2
            });
          }
        }
        
        try {
          // Insert students
          console.log(`Inserting ${studentsData.size} students...`);
          for (const studentData of studentsData.values()) {
            try {
              await db.insert(students)
                .values(studentData)
                .onConflictDoNothing();
            } catch (err) {
              console.log(`Student ${studentData.id} already exists, skipping`);
            }
          }
          
          // Insert modules
          console.log(`Inserting ${modulesData.size} modules...`);
          for (const moduleData of modulesData.values()) {
            try {
              await db.insert(modules)
                .values(moduleData)
                .onConflictDoNothing();
            } catch (err) {
              console.log(`Module ${moduleData.code} already exists, skipping`);
            }
          }
          
          // Get module IDs for results
          const moduleIdMap = new Map();
          const allModules = await db.select().from(modules);
          for (const module of allModules) {
            moduleIdMap.set(module.code, module.id);
          }
          
          // Insert student results
          console.log(`Inserting ${resultsData.length} student results...`);
          for (const result of resultsData) {
            const moduleId = moduleIdMap.get(result.moduleCode);
            if (!moduleId) {
              console.log(`Module not found for code: ${result.moduleCode}`);
              continue;
            }
            
            try {
              await db.insert(studentResults)
                .values({
                  studentId: result.studentId,
                  moduleId: moduleId,
                  semester: result.semester,
                  year: result.year,
                  grade: result.grade,
                  gradePoint: result.gradePoint ? result.gradePoint.toString() : null,
                  status: result.status,
                  attemptNumber: result.attemptNumber
                })
                .onConflictDoNothing();
            } catch (err) {
              console.log(`Error inserting result for student ${result.studentId}, module ${result.moduleCode}:`, err.message);
            }
          }
          
          console.log('Data import completed successfully!');
          console.log(`- ${studentsData.size} students imported`);
          console.log(`- ${modulesData.size} modules imported`);
          console.log(`- ${resultsData.length} student results imported`);
          
          resolve();
        } catch (error) {
          console.error('Error during import:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Run the import
importStudentData().catch(console.error);