import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertStudentSchema,
  insertModuleSchema,
  insertStudentResultSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard endpoints
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/cgpa-trends", async (req, res) => {
    try {
      const trends = await storage.getCGPATrends();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching CGPA trends:", error);
      res.status(500).json({ message: "Failed to fetch CGPA trends" });
    }
  });

  app.get("/api/dashboard/insights", async (req, res) => {
    try {
      const insights = await storage.getPerformanceInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching performance insights:", error);
      res.status(500).json({ message: "Failed to fetch performance insights" });
    }
  });

  app.get("/api/dashboard/at-risk-students", async (req, res) => {
    try {
      const students = await storage.getAtRiskStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching at-risk students:", error);
      res.status(500).json({ message: "Failed to fetch at-risk students" });
    }
  });

  app.get("/api/dashboard/recent-activity", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/dashboard/performance-distribution", async (req, res) => {
    try {
      const distribution = await storage.getPerformanceDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching performance distribution:", error);
      res.status(500).json({ message: "Failed to fetch performance distribution" });
    }
  });

  // Student endpoints
  app.get("/api/students", async (req, res) => {
    try {
      const filters = {
        programme: req.query.programme as string,
        semester: req.query.semester ? parseInt(req.query.semester as string) : undefined,
        status: req.query.status as string,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await storage.getStudents(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // CSV Import endpoint
  app.post("/api/students/import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvData: any[] = [];
      const stream = Readable.from(req.file.buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => csvData.push(data))
        .on('end', async () => {
          try {
            const result = await storage.importStudentsFromCSV(csvData);
            res.json(result);
          } catch (error) {
            console.error("Error importing CSV:", error);
            res.status(500).json({ message: "Failed to import CSV data" });
          }
        });
    } catch (error) {
      console.error("Error processing CSV upload:", error);
      res.status(500).json({ message: "Failed to process CSV upload" });
    }
  });

  // CSV Export endpoint
  app.get("/api/students/export", async (req, res) => {
    try {
      const csvData = await storage.exportStudentsToCSV();
      
      // Convert to CSV format
      const csvHeaders = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value}"` : value
        ).join(',')
      );
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting students:", error);
      res.status(500).json({ message: "Failed to export students" });
    }
  });

  // Module endpoints
  app.get("/api/modules", async (req, res) => {
    try {
      const programme = req.query.programme as string;
      const modules = await storage.getModules(programme);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get("/api/modules/:id", async (req, res) => {
    try {
      const module = await storage.getModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.post("/api/modules", async (req, res) => {
    try {
      const validatedData = insertModuleSchema.parse(req.body);
      const module = await storage.createModule(validatedData);
      res.status(201).json(module);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  app.put("/api/modules/:id", async (req, res) => {
    try {
      const validatedData = insertModuleSchema.partial().parse(req.body);
      const module = await storage.updateModule(req.params.id, validatedData);
      res.json(module);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating module:", error);
      res.status(500).json({ message: "Failed to update module" });
    }
  });

  app.delete("/api/modules/:id", async (req, res) => {
    try {
      await storage.deleteModule(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({ message: "Failed to delete module" });
    }
  });

  // Student Results endpoints
  app.get("/api/students/:studentId/results", async (req, res) => {
    try {
      const results = await storage.getStudentResults(req.params.studentId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ message: "Failed to fetch student results" });
    }
  });

  app.post("/api/results", async (req, res) => {
    try {
      const validatedData = insertStudentResultSchema.parse(req.body);
      const result = await storage.createStudentResult(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating student result:", error);
      res.status(500).json({ message: "Failed to create student result" });
    }
  });

  app.put("/api/results/:id", async (req, res) => {
    try {
      const validatedData = insertStudentResultSchema.partial().parse(req.body);
      const result = await storage.updateStudentResult(req.params.id, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating student result:", error);
      res.status(500).json({ message: "Failed to update student result" });
    }
  });

  app.delete("/api/results/:id", async (req, res) => {
    try {
      await storage.deleteStudentResult(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student result:", error);
      res.status(500).json({ message: "Failed to delete student result" });
    }
  });

  // CGPA endpoints
  app.get("/api/students/:studentId/cgpa-history", async (req, res) => {
    try {
      const history = await storage.getCGPAHistory(req.params.studentId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching CGPA history:", error);
      res.status(500).json({ message: "Failed to fetch CGPA history" });
    }
  });

  app.post("/api/students/:studentId/calculate-cgpa", async (req, res) => {
    try {
      await storage.calculateAndUpdateCGPA(req.params.studentId);
      res.json({ message: "CGPA calculated and updated successfully" });
    } catch (error) {
      console.error("Error calculating CGPA:", error);
      res.status(500).json({ message: "Failed to calculate CGPA" });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      await storage.resolveAlert(req.params.id);
      res.json({ message: "Alert resolved successfully" });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
