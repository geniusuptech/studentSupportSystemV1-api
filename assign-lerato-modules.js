require('dotenv').config();
require('ts-node/register/transpile-only');
const db = require('./src/config/database.ts').default;

const TARGET_STUDENT_NAME = 'Lerato Khumalo';

const PROGRAM_MODULES = {
  1: ['Data Structures and Algorithms', 'Object-Oriented Programming', 'Database Management Systems', 'Software Engineering'],
  2: ['Business Management', 'Financial Accounting', 'Marketing Principles', 'Human Resource Management'],
  3: ['Engineering Mathematics', 'Physics for Engineers', 'Engineering Design', 'Materials Science'],
  4: ['Human Anatomy', 'Physiology', 'Biochemistry', 'Pathology'],
  5: ['Introduction to Psychology', 'Cognitive Psychology', 'Social Psychology', 'Developmental Psychology'],
  6: ['Constitutional Law', 'Criminal Law', 'Contract Law', 'Commercial Law']
};

async function run() {
  try {
    await db.connect();

    const students = await db.executeQuery(
      `
      SELECT TOP 1
        s.StudentID,
        s.StudentName,
        s.ProgramID,
        p.ProgramName
      FROM Students s
      LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE s.StudentName = @studentName
        AND s.IsActive = 1
      ORDER BY s.StudentID
      `,
      { studentName: TARGET_STUDENT_NAME }
    );

    if (!students.length) {
      throw new Error(`Student "${TARGET_STUDENT_NAME}" not found or inactive.`);
    }

    const student = students[0];
    const modules = PROGRAM_MODULES[student.ProgramID] || [
      'Academic Literacy',
      'Critical Thinking',
      'Quantitative Reasoning',
      'Research Methods'
    ];

    await db.executeQuery(
      `
      UPDATE Students
      SET
        Module1 = @module1,
        Module2 = @module2,
        Module3 = @module3,
        Module4 = @module4,
        UpdatedAt = GETDATE()
      WHERE StudentID = @studentId
      `,
      {
        studentId: student.StudentID,
        module1: modules[0],
        module2: modules[1],
        module3: modules[2],
        module4: modules[3]
      }
    );

    const updated = await db.executeQuery(
      `
      SELECT
        StudentID,
        StudentName,
        ProgramID,
        Module1,
        Module2,
        Module3,
        Module4
      FROM Students
      WHERE StudentID = @studentId
      `,
      { studentId: student.StudentID }
    );

    console.log('Assigned modules to Lerato Khumalo successfully:');
    console.log(JSON.stringify(updated[0], null, 2));
  } catch (error) {
    console.error('Failed to assign Lerato modules:', error.message || error);
    process.exitCode = 1;
  } finally {
    try {
      await db.disconnect();
    } catch {
      // ignore disconnect errors
    }
  }
}

run();
