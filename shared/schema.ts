import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  decimal, 
  integer, 
  timestamp, 
  boolean,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const programmeEnum = pgEnum("programme", ["Computer Science", "Software Engineering"]);
export const gradeEnum = pgEnum("grade", ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "XF"]);
export const statusEnum = pgEnum("status", ["Active", "Probation", "Dean's List", "Suspended", "Graduated"]);
export const moduleStatusEnum = pgEnum("module_status", ["Completed", "In Progress", "Failed", "Exempted", "Credit Transfer"]);

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: varchar("email").unique().notNull(),
  programme: programmeEnum("programme").notNull(),
  intakeYear: integer("intake_year").notNull(),
  currentSemester: integer("current_semester").notNull().default(1),
  status: statusEnum("status").notNull().default("Active"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Modules table
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).unique().notNull(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  semester: integer("semester").notNull(),
  programme: programmeEnum("programme").notNull(),
  isCore: boolean("is_core").notNull().default(true),
  prerequisites: text("prerequisites").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Results table
export const studentResults = pgTable("student_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  moduleId: uuid("module_id").references(() => modules.id).notNull(),
  semester: integer("semester").notNull(),
  year: integer("year").notNull(),
  grade: gradeEnum("grade"),
  gradePoint: decimal("grade_point", { precision: 3, scale: 2 }),
  status: moduleStatusEnum("status").notNull(),
  attemptNumber: integer("attempt_number").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CGPA Records table
export const cgpaRecords = pgTable("cgpa_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  semester: integer("semester").notNull(),
  year: integer("year").notNull(),
  semesterGPA: decimal("semester_gpa", { precision: 3, scale: 2 }).notNull(),
  cumulativeCGPA: decimal("cumulative_cgpa", { precision: 3, scale: 2 }).notNull(),
  totalCreditsEarned: integer("total_credits_earned").notNull(),
  totalCreditsAttempted: integer("total_credits_attempted").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Academic Alerts table
export const academicAlerts = pgTable("academic_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  alertType: varchar("alert_type").notNull(), // 'probation', 'dean_list', 'repeated_failure', 'at_risk'
  message: text("message").notNull(),
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Activity Log table
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(), // 'student', 'module', 'result'
  entityId: varchar("entity_id").notNull(),
  description: text("description").notNull(),
  performedBy: varchar("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  results: many(studentResults),
  cgpaRecords: many(cgpaRecords),
  alerts: many(academicAlerts),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  results: many(studentResults),
}));

export const studentResultsRelations = relations(studentResults, ({ one }) => ({
  student: one(students, {
    fields: [studentResults.studentId],
    references: [students.id],
  }),
  module: one(modules, {
    fields: [studentResults.moduleId],
    references: [modules.id],
  }),
}));

export const cgpaRecordsRelations = relations(cgpaRecords, ({ one }) => ({
  student: one(students, {
    fields: [cgpaRecords.studentId],
    references: [students.id],
  }),
}));

export const academicAlertsRelations = relations(academicAlerts, ({ one }) => ({
  student: one(students, {
    fields: [academicAlerts.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertStudentResultSchema = createInsertSchema(studentResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCgpaRecordSchema = createInsertSchema(cgpaRecords).omit({
  id: true,
  createdAt: true,
});

export const insertAcademicAlertSchema = createInsertSchema(academicAlerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type StudentResult = typeof studentResults.$inferSelect;
export type InsertStudentResult = z.infer<typeof insertStudentResultSchema>;

export type CgpaRecord = typeof cgpaRecords.$inferSelect;
export type InsertCgpaRecord = z.infer<typeof insertCgpaRecordSchema>;

export type AcademicAlert = typeof academicAlerts.$inferSelect;
export type InsertAcademicAlert = z.infer<typeof insertAcademicAlertSchema>;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Complex types for API responses
export type StudentWithDetails = Student & {
  results: (StudentResult & { module: Module })[];
  cgpaRecords: CgpaRecord[];
  alerts: AcademicAlert[];
  currentCGPA: number;
  totalCreditsEarned: number;
  remainingCredits: number;
  semestersLeft: number;
};

export type DashboardMetrics = {
  totalStudents: number;
  deansListCount: number;
  probationCount: number;
  avgCGPA: number;
  cgpaTrend: number;
};

export type PerformanceInsight = {
  type: 'positive' | 'warning' | 'critical';
  title: string;
  description: string;
  actionRequired?: boolean;
};
