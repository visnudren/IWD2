import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { students, modules, studentResults, cgpaRecords } from '../shared/schema.ts';
import { eq, and } from 'drizzle-orm';
import * as fs from 'fs';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function importStudentResults() {
  try {
    console.log('Reading CSV file...');
    const csvContent = fs.readFileSync('./attached_assets/2025-06-06 IWD Assignment1_1755685682593.csv', 'utf8');
    const lines = csvContent.split('\n');
    
    let success = 0;
    let errors = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      if (columns.length < 8) continue;
      
      const studentId = columns[1]?.trim();
      const studentName = columns[2]?.trim();
      const intake = columns[3]?.trim();
      const subjectCode = columns[4]?.trim();
      const subjectName = columns[5]?.trim();
      const grade = columns[6]?.trim();
      const comment = columns[7]?.trim();
      const programme = columns[8]?.trim();
      
      // Skip invalid rows
      if (!studentId || !subjectCode || !grade || studentId === 'ID') continue;
      
      // Skip non-graded items (e, ct, n, 1, etc.)
      const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
      if (!validGrades.includes(grade)) continue;
      
      try {
        // Find student
        const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
        if (!student) {
          console.log(`Student ${studentId} not found, skipping result`);
          continue;
        }
        
        // Find module
        const [module] = await db.select().from(modules).where(eq(modules.code, subjectCode)).limit(1);
        if (!module) {
          console.log(`Module ${subjectCode} not found, skipping result`);
          continue;
        }
        
        // Calculate grade point
        const gradePoints = {
          'A+': 4.0, 'A': 4.0, 'A-': 3.7,
          'B+': 3.3, 'B': 3.0, 'B-': 2.7,
          'C+': 2.3, 'C': 2.0, 'C-': 1.7,
          'D+': 1.3, 'D': 1.0, 'F': 0.0
        };
        
        // Check if result already exists
        const [existingResult] = await db.select()
          .from(studentResults)
          .where(and(
            eq(studentResults.studentId, studentId),
            eq(studentResults.moduleId, module.id)
          ))
          .limit(1);
          
        if (!existingResult) {
          // Insert student result
          await db.insert(studentResults).values({
            studentId: studentId,
            moduleId: module.id,
            grade: grade,
            gradePoint: gradePoints[grade].toString(),
            credits: module.credits,
            semester: intake || 'Unknown',
            year: 2024, // Default year
            status: 'Completed'
          });
          
          success++;
          if (success % 50 === 0) {
            console.log(`Processed ${success} results...`);
          }
        }
        
      } catch (error) {
        errors.push(`Row ${i}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Import completed: ${success} results imported, ${errors.length} errors`);
    
    // Calculate CGPA for all students
    console.log('Calculating CGPA for all students...');
    const allStudents = await db.select().from(students);
    
    for (const student of allStudents) {
      await calculateCGPA(student.id);
    }
    
    console.log('✅ CGPA calculation completed');
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.slice(0, 10).forEach(error => console.log(error));
    }
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

async function calculateCGPA(studentId) {
  try {
    // Get all completed results for the student
    const results = await db
      .select({
        gradePoint: studentResults.gradePoint,
        credits: studentResults.credits,
        semester: studentResults.semester,
        year: studentResults.year
      })
      .from(studentResults)
      .innerJoin(modules, eq(studentResults.moduleId, modules.id))
      .where(and(
        eq(studentResults.studentId, studentId),
        eq(studentResults.status, 'Completed')
      ));

    if (results.length === 0) return;

    // Calculate cumulative CGPA
    let totalGradePoints = 0;
    let totalCredits = 0;

    results.forEach(result => {
      if (result.gradePoint) {
        totalGradePoints += parseFloat(result.gradePoint) * result.credits;
        totalCredits += result.credits;
      }
    });

    const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Get the latest semester and year
    const latestResult = results.reduce((latest, current) => {
      if (!latest || 
          current.year > latest.year || 
          (current.year === latest.year && current.semester > latest.semester)) {
        return current;
      }
      return latest;
    }, results[0]);

    if (latestResult) {
      // Check if record already exists
      const [existingRecord] = await db
        .select()
        .from(cgpaRecords)
        .where(and(
          eq(cgpaRecords.studentId, studentId),
          eq(cgpaRecords.semester, latestResult.semester),
          eq(cgpaRecords.year, latestResult.year)
        ))
        .limit(1);

      if (existingRecord) {
        // Update existing record
        await db
          .update(cgpaRecords)
          .set({
            cumulativeCGPA: cgpa.toFixed(2),
            totalCreditsEarned: totalCredits,
            totalCreditsAttempted: totalCredits
          })
          .where(eq(cgpaRecords.id, existingRecord.id));
      } else {
        // Create new record
        await db.insert(cgpaRecords).values({
          studentId: studentId,
          semester: latestResult.semester,
          year: latestResult.year,
          cumulativeCGPA: cgpa.toFixed(2),
          totalCreditsEarned: totalCredits,
          totalCreditsAttempted: totalCredits
        });
      }
    }
  } catch (error) {
    console.error(`Error calculating CGPA for student ${studentId}:`, error);
  }
}

importStudentResults();