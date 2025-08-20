import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { modules } from '../shared/schema.ts';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const subjectsData = [
  { code: "MPU3183N", name: "Penghayatan Etika dan Peradaban", credits: 3, programme: "UEIS" },
  { code: "KBEN1033N", name: "Oral Communication", credits: 3, programme: "UEIS" },
  { code: "XBCS1043N", name: "Computing Mathematics", credits: 3, programme: "UEIS" },
  { code: "XBCS1143N", name: "Application Development", credits: 3, programme: "UEIS" },
  { code: "XBCS1183N", name: "Database Management & Security", credits: 3, programme: "UEIS" },
  { code: "MPU3333N", name: "Integrity and Anti Corruption", credits: 3, programme: "UEIS" },
  { code: "MPU3323N", name: "Malaysia and Global Issues", credits: 3, programme: "UEIS" },
  { code: "XBCS1123N", name: "Statistics", credits: 3, programme: "UEIS" },
  { code: "MPU3143N", name: "Bahasa Melayu Komunikasi 2", credits: 3, programme: "UEIS" },
  { code: "MPU3123N", name: "Tamadun Islam & Tamadun Asia", credits: 3, programme: "UEIS" },
  { code: "KBRM3014N", name: "Research Methodology", credits: 4, programme: "UEIS" },
  { code: "MPU3213", name: "Bahasa Kebangsaan A", credits: 3, programme: "UEIS" },
  { code: "XBCS2103N", name: "Fundamentals of Object Oriented Programming", credits: 3, programme: "UEIS" },
  { code: "XBCS2013N", name: "Principles of Software Engineering", credits: 3, programme: "UEIS" },
  { code: "XBCS2193N", name: "HCI & User Experience", credits: 3, programme: "UEIS" },
  { code: "MPU3193N", name: "Philosophy and Current Issues", credits: 3, programme: "UEIS" },
  { code: "MPU3113", name: "Hubungan Etnik", credits: 3, programme: "UEIS" },
  { code: "XBCS1153N", name: "System Analysis and Design", credits: 3, programme: "UEIS" },
  { code: "XBIS1034N", name: "Foundation of Information Systems", credits: 3, programme: "UEIS" },
  { code: "XBCS2163N", name: "Database Management Systems", credits: 3, programme: "UEIS" },
  { code: "XBIS2054N", name: "Data Science", credits: 3, programme: "UEIS" },
  { code: "XBIS3014N", name: "Enterprise Systems", credits: 4, programme: "UEIS" },
  { code: "XBIS2034N", name: "E-Commerce", credits: 3, programme: "UEIS" },
  { code: "XBIS2044N", name: "Enterprise Architecture", credits: 3, programme: "UEIS" },
  { code: "XBIS3034N", name: "Business Process Management", credits: 3, programme: "UEIS" },
  { code: "XBIS3024N", name: "Information Security", credits: 3, programme: "UEIS" },
  { code: "XBIS3044N", name: "Digital Business Strategy", credits: 3, programme: "UEIS" },
  { code: "XBMC3014N", name: "Internet & Web Development", credits: 4, programme: "UEIS" },
  { code: "XBCS2074N", name: "Computer Networks", credits: 3, programme: "UEIS" },
  { code: "XBIN2018N", name: "Industrial Training", credits: 3, programme: "UEIS" },
  { code: "XBCT3064N", name: "Final Year Project A", credits: 3, programme: "UEIS" },
  { code: "XBCT3074N", name: "Final Year Project B", credits: 3, programme: "UEIS" },
  { code: "BBAC2014N", name: "Management Accounting", credits: 3, programme: "UEIS" },
  { code: "BBAC1014N", name: "Financial Accounting", credits: 3, programme: "UEIS" },
  { code: "BBMK2024N", name: "Marketing", credits: 3, programme: "UEIS" },
  { code: "BBMG1013N", name: "Principles of Management", credits: 3, programme: "UEIS" },
  { code: "BBEC1013N", name: "Principles of Economics", credits: 3, programme: "UEIS" },
  { code: "BBFN1014N", name: "Principles of Finance", credits: 3, programme: "UEIS" },
  { code: "BBMG3024N", name: "Strategic Management", credits: 3, programme: "UEIS" },
  { code: "BBMG2014N", name: "Organizational Behaviour", credits: 3, programme: "UEIS" },
  { code: "BBLG2034N", name: "Supply Chain Management", credits: 3, programme: "UEIS" },
  { code: "XBCS2094N", name: "GUI Programming", credits: 3, programme: "UEIS" },
  { code: "XBCS2064N", name: "Integrative Consultancy Project", credits: 3, programme: "UEIS" },
  { code: "XBCS2124N", name: "Computational Intelligence", credits: 3, programme: "UEIS" },
  { code: "XBIN3018N", name: "Internship", credits: 3, programme: "UEIS" }
];

async function createModules() {
  try {
    console.log('Creating modules from CSV data...');
    
    for (const subject of subjectsData) {
      try {
        await db.insert(modules).values({
          code: subject.code,
          name: subject.name,
          credits: subject.credits,
          programme: subject.programme,
          description: `${subject.name} - ${subject.programme} Programme`
        }).onConflictDoNothing();
        
        console.log(`✓ Created module: ${subject.code} - ${subject.name}`);
      } catch (error) {
        console.log(`⚠ Module ${subject.code} may already exist: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Successfully processed ${subjectsData.length} modules`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error creating modules:', error);
    process.exit(1);
  }
}

createModules();