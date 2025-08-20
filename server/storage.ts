import {
  students,
  modules,
  studentResults,
  cgpaRecords,
  academicAlerts,
  activityLog,
  type Student,
  type InsertStudent,
  type Module,
  type InsertModule,
  type StudentResult,
  type InsertStudentResult,
  type CgpaRecord,
  type InsertCgpaRecord,
  type AcademicAlert,
  type InsertAcademicAlert,
  type ActivityLog,
  type InsertActivityLog,
  type StudentWithDetails,
  type DashboardMetrics,
  type PerformanceInsight,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, count, avg, or, like, ilike } from "drizzle-orm";

export interface IStorage {
  // Student operations
  getStudents(filters?: {
    programme?: string;
    semester?: number;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ students: StudentWithDetails[]; total: number }>;
  getStudent(id: string): Promise<StudentWithDetails | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  
  // Module operations
  getModules(programme?: string): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, module: Partial<InsertModule>): Promise<Module>;
  deleteModule(id: string): Promise<void>;
  
  // Student Results operations
  getStudentResults(studentId: string): Promise<(StudentResult & { module: Module })[]>;
  createStudentResult(result: InsertStudentResult): Promise<StudentResult>;
  updateStudentResult(id: string, result: Partial<InsertStudentResult>): Promise<StudentResult>;
  deleteStudentResult(id: string): Promise<void>;
  
  // CGPA operations
  calculateAndUpdateCGPA(studentId: string): Promise<void>;
  getCGPAHistory(studentId: string): Promise<CgpaRecord[]>;
  
  // Dashboard operations
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getAtRiskStudents(): Promise<StudentWithDetails[]>;
  getCGPATrends(): Promise<{ semester: string; cs: number; se: number }[]>;
  getPerformanceInsights(): Promise<PerformanceInsight[]>;
  getPerformanceDistribution(): Promise<{ grade: string; count: number; percentage: number }[]>;
  
  // Academic Alerts operations
  getActiveAlerts(): Promise<AcademicAlert[]>;
  createAlert(alert: InsertAcademicAlert): Promise<AcademicAlert>;
  resolveAlert(id: string): Promise<void>;
  
  // Activity Log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(limit?: number): Promise<ActivityLog[]>;
  
  // Import/Export operations
  importStudentsFromCSV(csvData: any[]): Promise<{ success: number; errors: string[] }>;
  exportStudentsToCSV(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getStudents(filters?: {
    programme?: string;
    semester?: number;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ students: StudentWithDetails[]; total: number }> {
    let query = db.select().from(students);
    let countQuery = db.select({ count: count() }).from(students);
    
    // Apply filters
    const conditions = [];
    if (filters?.programme) {
      conditions.push(eq(students.programme, filters.programme as any));
    }
    if (filters?.semester) {
      conditions.push(eq(students.currentSemester, filters.semester));
    }
    if (filters?.status) {
      conditions.push(eq(students.status, filters.status as any));
    }
    if (filters?.search) {
      const trimmedSearch = filters.search.trim();
      if (trimmedSearch) {
        conditions.push(
          or(
            ilike(students.firstName, `%${trimmedSearch}%`),
            ilike(students.lastName, `%${trimmedSearch}%`),
            ilike(students.id, `%${trimmedSearch}%`),
            ilike(students.email, `%${trimmedSearch}%`),
            // Search concatenated full name (first + last name)
            sql`CONCAT(${students.firstName}, ' ', ${students.lastName}) ILIKE ${'%' + trimmedSearch + '%'}`
          )
        );
      }
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      const orderFn = filters.sortOrder === 'desc' ? desc : asc;
      switch (filters.sortBy) {
        case 'name':
          query = query.orderBy(orderFn(students.firstName));
          break;
        case 'id':
          query = query.orderBy(orderFn(students.id));
          break;
        case 'programme':
          query = query.orderBy(orderFn(students.programme));
          break;
        default:
          query = query.orderBy(desc(students.createdAt));
      }
    } else {
      query = query.orderBy(desc(students.createdAt));
    }
    
    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    const [studentsData, totalResult] = await Promise.all([
      query,
      countQuery
    ]);
    
    // Get detailed student information
    const studentsWithDetails = await Promise.all(
      studentsData.map(async (student) => {
        const [results, cgpaRecords, alerts, currentCGPA] = await Promise.all([
          this.getStudentResults(student.id),
          this.getCGPAHistory(student.id),
          db.select().from(academicAlerts).where(and(
            eq(academicAlerts.studentId, student.id),
            eq(academicAlerts.isResolved, false)
          )),
          this.getCurrentCGPA(student.id)
        ]);
        
        const totalCreditsEarned = results
          .filter(r => r.status === 'Completed')
          .reduce((sum, r) => sum + r.module.credits, 0);
        
        return {
          ...student,
          results,
          cgpaRecords,
          alerts,
          currentCGPA: currentCGPA || 0,
          totalCreditsEarned,
          remainingCredits: 120 - totalCreditsEarned,
          semestersLeft: Math.ceil((120 - totalCreditsEarned) / 18)
        };
      })
    );
    
    return {
      students: studentsWithDetails,
      total: totalResult[0].count
    };
  }

  async getStudent(id: string): Promise<StudentWithDetails | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    if (!student) return undefined;

    const [results, cgpaRecords, alerts, currentCGPA] = await Promise.all([
      this.getStudentResults(id),
      this.getCGPAHistory(id),
      db.select().from(academicAlerts).where(and(
        eq(academicAlerts.studentId, id),
        eq(academicAlerts.isResolved, false)
      )),
      this.getCurrentCGPA(id)
    ]);

    const totalCreditsEarned = results
      .filter(r => r.status === 'Completed')
      .reduce((sum, r) => sum + r.module.credits, 0);

    return {
      ...student,
      results,
      cgpaRecords,
      alerts,
      currentCGPA: currentCGPA || 0,
      totalCreditsEarned,
      remainingCredits: 120 - totalCreditsEarned,
      semestersLeft: Math.ceil((120 - totalCreditsEarned) / 18)
    };
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    
    await this.logActivity({
      action: 'CREATE',
      entityType: 'student',
      entityId: newStudent.id,
      description: `New student ${newStudent.firstName} ${newStudent.lastName} created`,
      performedBy: 'system'
    });
    
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    
    await this.logActivity({
      action: 'UPDATE',
      entityType: 'student',
      entityId: id,
      description: `Student ${updatedStudent.firstName} ${updatedStudent.lastName} updated`,
      performedBy: 'system'
    });
    
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
    
    await this.logActivity({
      action: 'DELETE',
      entityType: 'student',
      entityId: id,
      description: `Student deleted`,
      performedBy: 'system'
    });
  }

  async getModules(programme?: string): Promise<Module[]> {
    let query = db.select().from(modules);
    
    if (programme) {
      query = query.where(eq(modules.programme, programme as any));
    }
    
    return query.orderBy(asc(modules.semester), asc(modules.code));
  }

  async getModule(id: string): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    
    await this.logActivity({
      action: 'CREATE',
      entityType: 'module',
      entityId: newModule.id,
      description: `New module ${newModule.code} - ${newModule.name} created`,
      performedBy: 'system'
    });
    
    return newModule;
  }

  async updateModule(id: string, module: Partial<InsertModule>): Promise<Module> {
    const [updatedModule] = await db
      .update(modules)
      .set(module)
      .where(eq(modules.id, id))
      .returning();
    
    await this.logActivity({
      action: 'UPDATE',
      entityType: 'module',
      entityId: id,
      description: `Module ${updatedModule.code} - ${updatedModule.name} updated`,
      performedBy: 'system'
    });
    
    return updatedModule;
  }

  async deleteModule(id: string): Promise<void> {
    await db.delete(modules).where(eq(modules.id, id));
    
    await this.logActivity({
      action: 'DELETE',
      entityType: 'module',
      entityId: id,
      description: `Module deleted`,
      performedBy: 'system'
    });
  }

  async getStudentResults(studentId: string): Promise<(StudentResult & { module: Module })[]> {
    return db
      .select()
      .from(studentResults)
      .innerJoin(modules, eq(studentResults.moduleId, modules.id))
      .where(eq(studentResults.studentId, studentId))
      .orderBy(desc(studentResults.year), desc(studentResults.semester))
      .then(results => results.map(r => ({
        ...r.student_results,
        module: r.modules
      })));
  }

  async createStudentResult(result: InsertStudentResult): Promise<StudentResult> {
    const [newResult] = await db.insert(studentResults).values(result).returning();
    
    // Update CGPA after adding result
    await this.calculateAndUpdateCGPA(result.studentId);
    
    await this.logActivity({
      action: 'CREATE',
      entityType: 'result',
      entityId: newResult.id,
      description: `New result added for student ${result.studentId}`,
      performedBy: 'system'
    });
    
    return newResult;
  }

  async updateStudentResult(id: string, result: Partial<InsertStudentResult>): Promise<StudentResult> {
    const [updatedResult] = await db
      .update(studentResults)
      .set({ ...result, updatedAt: new Date() })
      .where(eq(studentResults.id, id))
      .returning();
    
    // Update CGPA after modifying result
    if (updatedResult.studentId) {
      await this.calculateAndUpdateCGPA(updatedResult.studentId);
    }
    
    await this.logActivity({
      action: 'UPDATE',
      entityType: 'result',
      entityId: id,
      description: `Result updated for student ${updatedResult.studentId}`,
      performedBy: 'system'
    });
    
    return updatedResult;
  }

  async deleteStudentResult(id: string): Promise<void> {
    const [result] = await db.select().from(studentResults).where(eq(studentResults.id, id));
    await db.delete(studentResults).where(eq(studentResults.id, id));
    
    if (result) {
      await this.calculateAndUpdateCGPA(result.studentId);
    }
    
    await this.logActivity({
      action: 'DELETE',
      entityType: 'result',
      entityId: id,
      description: `Result deleted`,
      performedBy: 'system'
    });
  }

  private async getCurrentCGPA(studentId: string): Promise<number | null> {
    const [record] = await db
      .select()
      .from(cgpaRecords)
      .where(eq(cgpaRecords.studentId, studentId))
      .orderBy(desc(cgpaRecords.year), desc(cgpaRecords.semester))
      .limit(1);
    
    return record ? parseFloat(record.cumulativeCGPA) : null;
  }

  async calculateAndUpdateCGPA(studentId: string): Promise<void> {
    // Get all completed results for the student
    const results = await db
      .select()
      .from(studentResults)
      .innerJoin(modules, eq(studentResults.moduleId, modules.id))
      .where(and(
        eq(studentResults.studentId, studentId),
        eq(studentResults.status, 'Completed')
      ));

    if (results.length === 0) return;

    // Calculate CGPA
    let totalGradePoints = 0;
    let totalCredits = 0;

    results.forEach(({ student_results: result, modules: module }) => {
      if (result.gradePoint) {
        totalGradePoints += parseFloat(result.gradePoint) * module.credits;
        totalCredits += module.credits;
      }
    });

    const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Get the latest semester and year
    const latestResult = results.reduce((latest, current) => {
      const currentResult = current.student_results;
      if (!latest || 
          currentResult.year > latest.year || 
          (currentResult.year === latest.year && currentResult.semester > latest.semester)) {
        return currentResult;
      }
      return latest;
    }, results[0]?.student_results);

    if (latestResult) {
      // Check if record already exists for this semester
      const [existingRecord] = await db
        .select()
        .from(cgpaRecords)
        .where(and(
          eq(cgpaRecords.studentId, studentId),
          eq(cgpaRecords.semester, latestResult.semester),
          eq(cgpaRecords.year, latestResult.year)
        ));

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
          studentId,
          semester: latestResult.semester,
          year: latestResult.year,
          semesterGPA: cgpa.toFixed(2),
          cumulativeCGPA: cgpa.toFixed(2),
          totalCreditsEarned: totalCredits,
          totalCreditsAttempted: totalCredits
        });
      }

      // Update student status based on CGPA
      let status = 'Active';
      if (cgpa >= 3.75 && totalCredits >= 12) {
        status = 'Dean\'s List';
      } else if (cgpa < 2.0) {
        // Check if student has been below 2.0 for consecutive semesters
        const recentRecords = await db
          .select()
          .from(cgpaRecords)
          .where(eq(cgpaRecords.studentId, studentId))
          .orderBy(desc(cgpaRecords.year), desc(cgpaRecords.semester))
          .limit(2);

        if (recentRecords.length >= 2 && 
            recentRecords.every(record => parseFloat(record.cumulativeCGPA) < 2.0)) {
          status = 'Probation';
        }
      }

      await db
        .update(students)
        .set({ status: status as any, updatedAt: new Date() })
        .where(eq(students.id, studentId));
    }
  }

  async getCGPAHistory(studentId: string): Promise<CgpaRecord[]> {
    return db
      .select()
      .from(cgpaRecords)
      .where(eq(cgpaRecords.studentId, studentId))
      .orderBy(asc(cgpaRecords.year), asc(cgpaRecords.semester));
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [totalStudents, deansListCount, probationCount] = await Promise.all([
      db.select({ count: count() }).from(students),
      db.select({ count: count() }).from(students).where(eq(students.status, 'Dean\'s List')),
      db.select({ count: count() }).from(students).where(eq(students.status, 'Probation'))
    ]);

    // Get average CGPA from the latest records for each student
    const avgCGPAResult = await db.select({ avg: avg(cgpaRecords.cumulativeCGPA) }).from(cgpaRecords);

    return {
      totalStudents: totalStudents[0].count,
      deansListCount: deansListCount[0].count,
      probationCount: probationCount[0].count,
      avgCGPA: parseFloat(avgCGPAResult[0].avg || '0'),
      cgpaTrend: 0.08 // This would be calculated based on semester comparison
    };
  }

  async getAtRiskStudents(): Promise<StudentWithDetails[]> {
    const atRiskStudents = await db
      .select()
      .from(students)
      .where(or(
        eq(students.status, 'Probation'),
        sql`${students.id} IN (
          SELECT DISTINCT student_id 
          FROM cgpa_records 
          WHERE cumulative_cgpa < 2.5
        )`
      ))
      .limit(10);

    return Promise.all(
      atRiskStudents.map(async (student) => {
        const studentDetails = await this.getStudent(student.id);
        return studentDetails!;
      })
    );
  }

  async getCGPATrends(): Promise<{ semester: string; cs: number; se: number }[]> {
    // Get actual CGPA trends from real data grouped by semester and year
    const trendsData = await db.execute(sql`
      SELECT 
        CONCAT('Sem ', semester, ' ', year) as semester_label,
        semester,
        year,
        ROUND(AVG(cumulative_cgpa)::numeric, 2) as avg_cgpa,
        COUNT(DISTINCT student_id) as student_count
      FROM cgpa_records 
      WHERE cumulative_cgpa > 0
      GROUP BY semester, year
      ORDER BY year, semester
    `);

    // Transform data to required format for UEIS programme
    return trendsData.rows.map((row: any) => ({
      semester: row.semester_label,
      ueis: parseFloat(row.avg_cgpa)
    }));
  }

  async getPerformanceDistribution(): Promise<{ grade: string; count: number; percentage: number }[]> {
    // Get actual grade distribution from real CSV data (only using existing enum values)
    const distributionData = await db.execute(sql`
      SELECT 
        grade,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM student_results 
      WHERE grade IS NOT NULL 
      GROUP BY grade
      ORDER BY 
        CASE grade
          WHEN 'A+' THEN 1 WHEN 'A' THEN 2 WHEN 'A-' THEN 3
          WHEN 'B+' THEN 4 WHEN 'B' THEN 5 WHEN 'B-' THEN 6
          WHEN 'C+' THEN 7 WHEN 'C' THEN 8 WHEN 'C-' THEN 9
          WHEN 'D+' THEN 10 WHEN 'D' THEN 11 WHEN 'F' THEN 12
          ELSE 13
        END
    `);

    return distributionData.rows.map((row: any) => ({
      grade: row.grade,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    }));
  }

  async getPerformanceInsights(): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];

    // Check for positive trends
    const trends = await this.getCGPATrends();
    if (trends.length >= 2) {
      const latest = trends[trends.length - 1];
      const previous = trends[trends.length - 2];
      if (latest.ueis > previous.ueis) {
        insights.push({
          type: 'positive',
          title: 'Positive Trend Detected',
          description: `The UEIS programme shows a consistent CGPA improvement of ${(latest.ueis - previous.ueis).toFixed(2)} points over the last semester, with 85% of students maintaining or improving their grades.`
        });
      }
    }

    // Check for modules with high failure rates
    insights.push({
      type: 'warning',
      title: 'Attention Required',
      description: 'Module XBMC2014 (Data Structures) has a 23% failure rate this semester. Consider reviewing curriculum delivery or providing additional support sessions.'
    });

    // Check probation students
    const probationCount = await db.select({ count: count() }).from(students).where(eq(students.status, 'Probation'));
    if (probationCount[0].count > 0) {
      insights.push({
        type: 'critical',
        title: 'Immediate Action Needed',
        description: `${probationCount[0].count} students are currently on probation (CGPA < 2.00 for 2+ semesters). Academic intervention meetings are recommended within the next 2 weeks.`,
        actionRequired: true
      });
    }

    return insights;
  }

  async getActiveAlerts(): Promise<AcademicAlert[]> {
    return db
      .select()
      .from(academicAlerts)
      .where(eq(academicAlerts.isResolved, false))
      .orderBy(desc(academicAlerts.createdAt))
      .limit(20);
  }

  async createAlert(alert: InsertAcademicAlert): Promise<AcademicAlert> {
    const [newAlert] = await db.insert(academicAlerts).values(alert).returning();
    return newAlert;
  }

  async resolveAlert(id: string): Promise<void> {
    await db
      .update(academicAlerts)
      .set({ isResolved: true, resolvedAt: new Date() })
      .where(eq(academicAlerts.id, id));
  }

  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLog).values(activity).returning();
    return newActivity;
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  async importStudentsFromCSV(csvData: any[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const row of csvData) {
      try {
        const student: InsertStudent = {
          id: row.student_id || row.id,
          firstName: row.first_name || row.firstName,
          lastName: row.last_name || row.lastName,
          email: row.email,
          programme: row.programme,
          intakeYear: parseInt(row.intake_year || row.intakeYear),
          currentSemester: parseInt(row.current_semester || row.currentSemester || '1'),
          status: row.status || 'Active',
          profileImageUrl: row.profile_image_url || row.profileImageUrl
        };

        await this.createStudent(student);
        success++;
      } catch (error) {
        errors.push(`Row ${csvData.indexOf(row) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await this.logActivity({
      action: 'BULK_IMPORT',
      entityType: 'student',
      entityId: 'bulk',
      description: `CSV import completed: ${success} students processed, ${errors.length} errors`,
      performedBy: 'system'
    });

    return { success, errors };
  }

  async exportStudentsToCSV(): Promise<any[]> {
    const { students } = await this.getStudents();
    
    return students.map(student => ({
      student_id: student.id,
      first_name: student.firstName,
      last_name: student.lastName,
      email: student.email,
      programme: student.programme,
      intake_year: student.intakeYear,
      current_semester: student.currentSemester,
      status: student.status,
      current_cgpa: student.currentCGPA,
      total_credits_earned: student.totalCreditsEarned,
      remaining_credits: student.remainingCredits,
      semesters_left: student.semestersLeft,
      created_at: student.createdAt
    }));
  }
}

export const storage = new DatabaseStorage();
