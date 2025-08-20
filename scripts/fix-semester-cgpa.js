import { db } from '../server/db.ts';
import { students, studentResults, cgpaRecords, modules } from '../shared/schema.ts';
import { eq, and, sql } from 'drizzle-orm';

async function calculateSemesterBySemesterCGPAs() {
  console.log('Fixing semester-by-semester CGPA calculations...');
  
  // Clear existing CGPA records
  await db.delete(cgpaRecords);
  console.log('Cleared existing CGPA records');
  
  // Get all students
  const allStudents = await db.select({ id: students.id }).from(students);
  
  for (const student of allStudents) {
    console.log(`Processing ${student.id}...`);
    
    // Get all results for this student with modules
    const results = await db
      .select({
        studentId: studentResults.studentId,
        semester: studentResults.semester,
        year: studentResults.year,
        grade: studentResults.grade,
        gradePoint: studentResults.gradePoint,
        status: studentResults.status,
        credits: modules.credits
      })
      .from(studentResults)
      .innerJoin(modules, eq(studentResults.moduleId, modules.id))
      .where(eq(studentResults.studentId, student.id));
    
    if (results.length === 0) continue;
    
    // Group by semester/year
    const semesterGroups = new Map();
    
    for (const result of results) {
      const semesterKey = `${result.year}-${result.semester}`;
      if (!semesterGroups.has(semesterKey)) {
        semesterGroups.set(semesterKey, []);
      }
      semesterGroups.get(semesterKey).push(result);
    }
    
    let cumulativeGradePoints = 0;
    let cumulativeCredits = 0;
    
    // Process semesters in chronological order
    const sortedSemesters = Array.from(semesterGroups.keys())
      .sort((a, b) => {
        const [yearA, semA] = a.split('-').map(Number);
        const [yearB, semB] = b.split('-').map(Number);
        return yearA !== yearB ? yearA - yearB : semA - semB;
      });
    
    for (const semesterKey of sortedSemesters) {
      const semesterResults = semesterGroups.get(semesterKey);
      const [year, semester] = semesterKey.split('-').map(Number);
      
      // Calculate semester GPA from graded courses
      let semesterGradePoints = 0;
      let semesterCredits = 0;
      
      for (const result of semesterResults) {
        if (result.gradePoint && result.status === 'Completed') {
          const gradePoint = parseFloat(result.gradePoint);
          semesterGradePoints += gradePoint * result.credits;
          semesterCredits += result.credits;
          
          // Add to cumulative
          cumulativeGradePoints += gradePoint * result.credits;
          cumulativeCredits += result.credits;
        }
      }
      
      if (semesterCredits > 0) {
        const semesterGPA = semesterGradePoints / semesterCredits;
        const cumulativeCGPA = cumulativeCredits > 0 ? cumulativeGradePoints / cumulativeCredits : 0;
        
        // Insert semester record
        await db.insert(cgpaRecords).values({
          studentId: student.id,
          semester,
          year,
          semesterGPA: semesterGPA.toFixed(2),
          cumulativeCGPA: cumulativeCGPA.toFixed(2),
          totalCreditsEarned: cumulativeCredits,
          totalCreditsAttempted: cumulativeCredits
        });
        
        console.log(`  ${semesterKey}: Semester GPA = ${semesterGPA.toFixed(2)}, Cumulative CGPA = ${cumulativeCGPA.toFixed(2)}, Credits = ${cumulativeCredits}`);
      }
    }
    
    // Update student status based on final CGPA
    if (cumulativeCredits > 0) {
      const finalCGPA = cumulativeGradePoints / cumulativeCredits;
      let status = 'Active';
      
      if (finalCGPA >= 3.75 && cumulativeCredits >= 12) {
        status = "Dean's List";
        console.log(`  *** ${student.id} qualifies for Dean's List! CGPA: ${finalCGPA.toFixed(3)}, Credits: ${cumulativeCredits}`);
      } else if (finalCGPA < 2.0) {
        // Check for consecutive semesters below 2.0
        const recentRecords = await db
          .select()
          .from(cgpaRecords)
          .where(eq(cgpaRecords.studentId, student.id))
          .orderBy(sql`year DESC, semester DESC`)
          .limit(2);
          
        if (recentRecords.length >= 2 && 
            recentRecords.every(record => parseFloat(record.cumulativeCGPA) < 2.0)) {
          status = 'Probation';
          console.log(`  *** ${student.id} should be on Probation! CGPAs: ${recentRecords.map(r => r.cumulativeCGPA).join(', ')}`);
        }
      }
      
      await db
        .update(students)
        .set({ status: status, updatedAt: new Date() })
        .where(eq(students.id, student.id));
    }
  }
  
  // Final summary
  const [deansListCount, probationCount] = await Promise.all([
    db.select({ count: sql`COUNT(*)` }).from(students).where(eq(students.status, "Dean's List")),
    db.select({ count: sql`COUNT(*)` }).from(students).where(eq(students.status, 'Probation'))
  ]);
  
  console.log('\n=== FINAL RESULTS ===');
  console.log(`Students on Dean's List: ${deansListCount[0].count}`);
  console.log(`Students on Probation: ${probationCount[0].count}`);
  
  // Show Dean's List students
  if (deansListCount[0].count > 0) {
    const deansListStudents = await db
      .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
      .from(students)
      .where(eq(students.status, "Dean's List"));
    
    console.log('\nDean\'s List Students:');
    for (const student of deansListStudents) {
      console.log(`  ${student.id} - ${student.firstName} ${student.lastName}`);
    }
  }
  
  // Show Probation students  
  if (probationCount[0].count > 0) {
    const probationStudents = await db
      .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
      .from(students)
      .where(eq(students.status, 'Probation'));
      
    console.log('\nProbation Students:');
    for (const student of probationStudents) {
      console.log(`  ${student.id} - ${student.firstName} ${student.lastName}`);
    }
  }
}

calculateSemesterBySemesterCGPAs().catch(console.error);