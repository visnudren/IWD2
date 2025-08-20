import fs from 'fs';
import csv from 'csv-parser';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Grade mapping from CSV format to our standard format
const gradeMapping = {
  'A+': 'A', 'A': 'A', 'A-': 'A-',
  'B+': 'B+', 'B': 'B', 'B-': 'B-',
  'C+': 'C+', 'C': 'C', 'C-': 'C-',
  'D+': 'D+', 'D': 'D',
  'F': 'F', 'XF': 'F',
  'e': null, 'ct': null, 'n': null, '1': null, 'o': null, 'x': null, 'v': null, '0.5': null
};

// Grade point mapping
const gradePointMapping = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0,
  'F': 0.0, 'XF': 0.0
};

// Status mapping
const statusMapping = {
  'e': 'Exempted',
  'ct': 'Credit Transfer',
  'n': 'In Progress',
  '1': 'In Progress',
  'o': 'Completed',
  'x': 'Failed',
  'v': 'Completed',
  '0.5': 'In Progress'
};

// Convert intake to year and semester
function parseIntake(intake) {
  const [month, year] = intake.split('-');
  const fullYear = 2000 + parseInt(year);
  
  // Calculate current semester based on intake
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  let semester = 1;
  let semesterYear = fullYear;
  
  if (month === 'Jun') {
    // June intake starts in semester 1
    const monthsElapsed = (currentYear - fullYear) * 12 + (currentMonth - 6);
    semester = Math.max(1, Math.min(16, Math.floor(monthsElapsed / 4) + 1));
  } else if (month === 'Apr') {
    // April intake starts in semester 1
    const monthsElapsed = (currentYear - fullYear) * 12 + (currentMonth - 4);
    semester = Math.max(1, Math.min(16, Math.floor(monthsElapsed / 4) + 1));
  } else if (month === 'Feb') {
    // February intake
    const monthsElapsed = (currentYear - fullYear) * 12 + (currentMonth - 2);
    semester = Math.max(1, Math.min(16, Math.floor(monthsElapsed / 4) + 1));
  } else if (month === 'Oct') {
    // October intake
    const monthsElapsed = (currentYear - fullYear) * 12 + (currentMonth - 10);
    semester = Math.max(1, Math.min(16, Math.floor(monthsElapsed / 4) + 1));
  }
  
  return { semester, year: semesterYear };
}

async function importData() {
  try {
    const students = new Map();
    const results = [];
    
    // Read and parse CSV
    const csvData = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream('./attached_assets/2025-06-06 IWD Assignment1_1755685682593.csv')
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    // Process each row
    for (const row of csvData) {
      if (!row.ID || !row.Name || row.ID === 'ID') continue; // Skip header/invalid rows
      
      const studentId = row.ID;
      const [firstName, ...lastNameParts] = row.Name.split(' ');
      const lastName = lastNameParts.join(' ');
      const intake = row.Intake;
      const email = row.Email;
      const programme = 'Computer Science'; // All appear to be CS/UEIS
      
      const intakeInfo = parseIntake(intake);
      
      // Store unique student
      if (!students.has(studentId)) {
        // Determine status based on grades
        let status = 'Active';
        const studentRows = csvData.filter(r => r.ID === studentId);
        const completedSubjects = studentRows.filter(r => 
          r.Grade && ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'].includes(r.Grade)
        );
        const failedSubjects = studentRows.filter(r => 
          r.Grade && ['F', 'XF', 'x'].includes(r.Grade)
        );
        
        if (completedSubjects.length >= 8) {
          const avgGrade = completedSubjects.reduce((sum, r) => 
            sum + (gradePointMapping[r.Grade] || 0), 0) / completedSubjects.length;
          if (avgGrade >= 3.75) status = "Dean's List";
          else if (avgGrade < 2.0) status = 'Probation';
        }
        
        students.set(studentId, {
          id: studentId,
          firstName,
          lastName,
          email,
          programme,
          intakeYear: intakeInfo.year,
          currentSemester: intakeInfo.semester,
          status
        });
      }
      
      // Store result if it has a grade
      if (row.Grade && row['Subject Code'] && gradeMapping.hasOwnProperty(row.Grade)) {
        const grade = gradeMapping[row.Grade];
        const gradePoint = grade ? gradePointMapping[row.Grade] : null;
        const moduleStatus = statusMapping[row.Grade] || 'Completed';
        
        results.push({
          studentId,
          moduleCode: row['Subject Code'],
          grade,
          gradePoint,
          status: moduleStatus,
          semester: Math.floor(Math.random() * intakeInfo.semester) + 1, // Distribute across semesters
          year: intakeInfo.year,
          attemptNumber: row.Grade === '1' ? 2 : 1
        });
      }
    }

    console.log(`Found ${students.size} students and ${results.length} results`);

    // Insert students
    for (const student of students.values()) {
      await pool.query(`
        INSERT INTO students (id, first_name, last_name, email, programme, intake_year, current_semester, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          programme = EXCLUDED.programme,
          intake_year = EXCLUDED.intake_year,
          current_semester = EXCLUDED.current_semester,
          status = EXCLUDED.status
      `, [
        student.id, student.firstName, student.lastName, student.email,
        student.programme, student.intakeYear, student.currentSemester, student.status
      ]);
    }
    console.log('✓ Students imported');

    // Get module IDs
    const moduleQuery = await pool.query('SELECT id, code FROM modules');
    const moduleMap = new Map();
    moduleQuery.rows.forEach(row => moduleMap.set(row.code, row.id));

    // Insert results
    for (const result of results) {
      const moduleId = moduleMap.get(result.moduleCode);
      if (moduleId && result.grade) {
        await pool.query(`
          INSERT INTO student_results (student_id, module_id, semester, year, grade, grade_point, status, attempt_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          result.studentId, moduleId, result.semester, result.year,
          result.grade, result.gradePoint, result.status, result.attemptNumber
        ]);
      }
    }
    console.log('✓ Results imported');

    // Calculate and insert CGPA records for each student
    for (const studentId of students.keys()) {
      const studentResults = await pool.query(`
        SELECT sr.semester, sr.year, sr.grade_point, m.credits
        FROM student_results sr
        JOIN modules m ON sr.module_id = m.id
        WHERE sr.student_id = $1 AND sr.grade_point IS NOT NULL
        ORDER BY sr.year, sr.semester
      `, [studentId]);

      let cumulativePoints = 0;
      let cumulativeCredits = 0;

      for (const result of studentResults.rows) {
        cumulativePoints += result.grade_point * result.credits;
        cumulativeCredits += result.credits;
        
        const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;
        
        await pool.query(`
          INSERT INTO cgpa_records (student_id, semester, year, semester_gpa, cumulative_cgpa, total_credits_earned, total_credits_attempted)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          studentId, result.semester, result.year, cgpa, cgpa, cumulativeCredits, cumulativeCredits
        ]);
      }
    }
    console.log('✓ CGPA records calculated and imported');

    console.log('\n🎉 Data import completed successfully!');
    console.log(`Imported ${students.size} students with their academic records`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await pool.end();
  }
}

importData();