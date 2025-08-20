import { db } from '../server/db.ts';
import { students } from '../shared/schema.ts';
import { DatabaseStorage } from '../server/storage.ts';

async function recalculateAllCGPAs() {
  console.log('Starting CGPA recalculation for all students...');
  
  const storage = new DatabaseStorage();
  
  // Get all students
  const allStudents = await db.select({ id: students.id }).from(students);
  
  console.log(`Found ${allStudents.length} students to process...`);
  
  // Recalculate CGPA for each student
  for (const student of allStudents) {
    try {
      console.log(`Processing student: ${student.id}`);
      await storage.calculateAndUpdateCGPA(student.id);
    } catch (error) {
      console.error(`Error processing student ${student.id}:`, error.message);
    }
  }
  
  // Get updated counts
  const [deansListStudents, probationStudents] = await Promise.all([
    db.select().from(students).where(eq(students.status, "Dean's List")),
    db.select().from(students).where(eq(students.status, 'Probation'))
  ]);
  
  console.log('CGPA recalculation completed!');
  console.log(`- Students on Dean's List: ${deansListStudents.length}`);
  console.log(`- Students on Probation: ${probationStudents.length}`);
  
  // Show Dean's List students
  if (deansListStudents.length > 0) {
    console.log('\nDean\'s List students:');
    for (const student of deansListStudents) {
      const currentCGPA = await storage.getCurrentCGPA(student.id);
      const { students: [details] } = await storage.getStudents({ search: student.id, limit: 1 });
      if (details) {
        console.log(`  ${student.id} - ${student.firstName} ${student.lastName} - CGPA: ${currentCGPA}, Credits: ${details.totalCreditsEarned}`);
      }
    }
  }
  
  // Show Probation students
  if (probationStudents.length > 0) {
    console.log('\nProbation students:');
    for (const student of probationStudents) {
      const currentCGPA = await storage.getCurrentCGPA(student.id);
      console.log(`  ${student.id} - ${student.firstName} ${student.lastName} - CGPA: ${currentCGPA}`);
    }
  }
}

// Add missing import
import { eq } from 'drizzle-orm';

// Run the recalculation
recalculateAllCGPAs().catch(console.error);