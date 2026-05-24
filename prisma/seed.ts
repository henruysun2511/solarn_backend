import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding...');

  // ── Existing IDs ──────────────────────────────────────────
  const TEACHER_ACCOUNT_ID = '27116aea-5edd-4a48-ad09-21820037f0b0';
  const STUDENT_ACCOUNT_ID = 'bc4806a9-e31d-4fda-ac45-5e0aa5c4b894';
  const TEACHER_ID = '96401631-3ae4-49fd-b79f-a1c5658aabcf';
  const STUDENT_ID = '45a230fc-b538-4c20-8b86-8d77b35adfd3';
  const COURSE_ID = 'ef197da7-5b0e-411e-8c67-df63a2752fa4';
  const CLASS_A_ID = '30ffb833-3929-40ab-8737-b8e9467bb3bb';
  const CLASS_B_ID = '8b7cd0ed-a97e-4d56-81ac-4c0ed957540f';

  // ── New IDs (additional students, teachers, etc.) ────────
  const ADMIN_ROLE_ID = 'a0000000-0000-0000-0000-000000000001';
  const TEACHER_ROLE_ID = 'a0000000-0000-0000-0000-000000000002';
  const STUDENT_ROLE_ID = 'a0000000-0000-0000-0000-000000000003';
  const ROOM_A_ID = 'b0000000-0000-0000-0000-000000000001';
  const BRANCH_ID = 'b0000000-0000-0000-0000-000000000010';
  const SHIFT_MORNING_ID = 'b0000000-0000-0000-0000-000000000020';
  const SHIFT_AFTERNOON_ID = 'b0000000-0000-0000-0000-000000000021';
  const ADMIN_ACCOUNT_ID = 'c0000000-0000-0000-0000-000000000001';
  const ADMIN_PROFILE_ID = 'c0000000-0000-0000-0000-000000000002';
  const TEACHER2_ACCOUNT_ID = 'c0000000-0000-0000-0000-000000000003';
  const TEACHER2_PROFILE_ID = 'c0000000-0000-0000-0000-000000000004';
  const TEACHER2_ID = 'c0000000-0000-0000-0000-000000000005';
  const STUDENT2_ACCOUNT_ID = 'c0000000-0000-0000-0000-000000000006';
  const STUDENT2_PROFILE_ID = 'c0000000-0000-0000-0000-000000000007';
  const STUDENT2_ID = 'c0000000-0000-0000-0000-000000000008';
  const TEACHER3_ACCOUNT_ID = 'c0000000-0000-0000-0000-000000000009';
  const TEACHER3_PROFILE_ID = 'c0000000-0000-0000-0000-000000000010';
  const TEACHER3_ID = 'c0000000-0000-0000-0000-000000000011';
  const COURSE2_ID = 'c0000000-0000-0000-0000-000000000012';
  const CLASS_C_ID = 'c0000000-0000-0000-0000-000000000013';
  const SESSION_A1_ID = 'd0000000-0000-0000-0000-000000000001';
  const SESSION_A2_ID = 'd0000000-0000-0000-0000-000000000002';
  const SESSION_B1_ID = 'd0000000-0000-0000-0000-000000000003';
  const SESSION_A3_ID = 'd0000000-0000-0000-0000-000000000004';

  // ── 1. Base data: Roles, Rooms, StudyShifts, Branch ─────

  await prisma.role.upsert({
    where: { roleId: ADMIN_ROLE_ID },
    update: {},
    create: { roleId: ADMIN_ROLE_ID, roleName: 'Admin' }
  });
  await prisma.role.upsert({
    where: { roleId: TEACHER_ROLE_ID },
    update: {},
    create: { roleId: TEACHER_ROLE_ID, roleName: 'Teacher' }
  });
  await prisma.role.upsert({
    where: { roleId: STUDENT_ROLE_ID },
    update: {},
    create: { roleId: STUDENT_ROLE_ID, roleName: 'Student' }
  });

  await prisma.branch.upsert({
    where: { branchId: BRANCH_ID },
    update: {},
    create: {
      branchId: BRANCH_ID,
      branchCode: 'CS01',
      branchName: 'Cơ sở chính',
      address: '123 Nguyễn Huệ, Q1',
      phone: '0900000000'
    }
  });

  await prisma.room.upsert({
    where: { roomId: ROOM_A_ID },
    update: {},
    create: { roomId: ROOM_A_ID, roomCode: 'P101', capacity: 30, branchId: BRANCH_ID }
  });

  await prisma.studyShift.upsert({
    where: { shiftId: SHIFT_MORNING_ID },
    update: {},
    create: { shiftId: SHIFT_MORNING_ID, shiftCode: 'MORNING', shiftName: 'Sáng', timeRange: '08:00-10:00' }
  });
  await prisma.studyShift.upsert({
    where: { shiftId: SHIFT_AFTERNOON_ID },
    update: {},
    create: { shiftId: SHIFT_AFTERNOON_ID, shiftCode: 'AFTERNOON', shiftName: 'Chiều', timeRange: '14:00-16:00' }
  });

  // ── 2. Accounts + Profiles ───────────────────────────────

  // Admin
  await prisma.account.upsert({
    where: { accountId: ADMIN_ACCOUNT_ID },
    update: {},
    create: { accountId: ADMIN_ACCOUNT_ID, username: 'admin', password: '$2b$10$dummy', roleId: ADMIN_ROLE_ID }
  });
  await prisma.profile.upsert({
    where: { accountId: ADMIN_ACCOUNT_ID },
    update: {},
    create: {
      profileId: ADMIN_PROFILE_ID,
      accountId: ADMIN_ACCOUNT_ID,
      fullName: 'Admin System',
      email: 'admin@solarn.com'
    }
  });

  // Teacher 1 (existing)
  await prisma.account.upsert({
    where: { accountId: TEACHER_ACCOUNT_ID },
    update: {},
    create: { accountId: TEACHER_ACCOUNT_ID, username: 'teacher1', password: '$2b$10$dummy', roleId: TEACHER_ROLE_ID }
  });
  await prisma.profile.upsert({
    where: { accountId: TEACHER_ACCOUNT_ID },
    update: {},
    create: {
      profileId: TEACHER_ID,
      accountId: TEACHER_ACCOUNT_ID,
      fullName: 'Nguyễn Văn A',
      email: 'teacher1@solarn.com'
    }
  });
  await prisma.teacher.upsert({
    where: { teacherId: TEACHER_ID },
    update: {},
    create: { teacherId: TEACHER_ID, teacherCode: 'GV001', profileId: TEACHER_ID, salaryRate: 500000 }
  });

  // Student 1 (existing)
  await prisma.account.upsert({
    where: { accountId: STUDENT_ACCOUNT_ID },
    update: {},
    create: { accountId: STUDENT_ACCOUNT_ID, username: 'student1', password: '$2b$10$dummy', roleId: STUDENT_ROLE_ID }
  });
  await prisma.profile.upsert({
    where: { accountId: STUDENT_ACCOUNT_ID },
    update: {},
    create: {
      profileId: STUDENT_ID,
      accountId: STUDENT_ACCOUNT_ID,
      fullName: 'Trần Thị B',
      email: 'student1@solarn.com'
    }
  });
  await prisma.student.upsert({
    where: { studentId: STUDENT_ID },
    update: {},
    create: { studentId: STUDENT_ID, studentCode: 'HS001', profileId: STUDENT_ID }
  });

  // Teacher 2 (new)
  await prisma.account.upsert({
    where: { accountId: TEACHER2_ACCOUNT_ID },
    update: {},
    create: { accountId: TEACHER2_ACCOUNT_ID, username: 'teacher2', password: '$2b$10$dummy', roleId: TEACHER_ROLE_ID }
  });
  await prisma.profile.upsert({
    where: { accountId: TEACHER2_ACCOUNT_ID },
    update: {},
    create: {
      profileId: TEACHER2_PROFILE_ID,
      accountId: TEACHER2_ACCOUNT_ID,
      fullName: 'Lê Văn C',
      email: 'teacher2@solarn.com'
    }
  });
  await prisma.teacher.upsert({
    where: { teacherId: TEACHER2_ID },
    update: {},
    create: { teacherId: TEACHER2_ID, teacherCode: 'GV002', profileId: TEACHER2_PROFILE_ID, salaryRate: 450000 }
  });

  // Student 2 (new)
  await prisma.account.upsert({
    where: { accountId: STUDENT2_ACCOUNT_ID },
    update: {},
    create: { accountId: STUDENT2_ACCOUNT_ID, username: 'student2', password: '$2b$10$dummy', roleId: STUDENT_ROLE_ID }
  });
  await prisma.profile.upsert({
    where: { accountId: STUDENT2_ACCOUNT_ID },
    update: {},
    create: {
      profileId: STUDENT2_PROFILE_ID,
      accountId: STUDENT2_ACCOUNT_ID,
      fullName: 'Phạm Thị D',
      email: 'student2@solarn.com'
    }
  });
  await prisma.student.upsert({
    where: { studentId: STUDENT2_ID },
    update: {},
    create: { studentId: STUDENT2_ID, studentCode: 'HS002', profileId: STUDENT2_PROFILE_ID }
  });

  // Teacher 3 (new, for salary complaint)
  await prisma.account.upsert({
    where: { accountId: TEACHER3_ACCOUNT_ID },
    update: {},
    create: { accountId: TEACHER3_ACCOUNT_ID, username: 'teacher3', password: '$2b$10$dummy', roleId: TEACHER_ROLE_ID }
  });
  await prisma.profile.upsert({
    where: { accountId: TEACHER3_ACCOUNT_ID },
    update: {},
    create: {
      profileId: TEACHER3_PROFILE_ID,
      accountId: TEACHER3_ACCOUNT_ID,
      fullName: 'Hoàng Văn E',
      email: 'teacher3@solarn.com'
    }
  });
  await prisma.teacher.upsert({
    where: { teacherId: TEACHER3_ID },
    update: {},
    create: { teacherId: TEACHER3_ID, teacherCode: 'GV003', profileId: TEACHER3_PROFILE_ID, salaryRate: 400000 }
  });

  // ── 3. Courses ────────────────────────────────────────────

  await prisma.course.upsert({
    where: { courseId: COURSE_ID },
    update: {},
    create: { courseId: COURSE_ID, courseName: 'Lập trình Frontend', tuitionFee: 5000000, totalSessions: 12 }
  });
  await prisma.course.upsert({
    where: { courseId: COURSE2_ID },
    update: {},
    create: { courseId: COURSE2_ID, courseName: 'Lập trình Backend', tuitionFee: 6000000, totalSessions: 10 }
  });

  // ── 4. Classes ────────────────────────────────────────────
  const today = new Date();

  await prisma.class.upsert({
    where: { classId: CLASS_A_ID },
    update: {},
    create: {
      classId: CLASS_A_ID,
      classCode: 'FE001',
      courseId: COURSE_ID,
      teacherId: TEACHER_ID,
      startDate: new Date(today.getTime() - 30 * 86400000),
      maxStudents: 20,
      roomCode: 'P101'
    }
  });
  await prisma.class.upsert({
    where: { classId: CLASS_B_ID },
    update: {},
    create: {
      classId: CLASS_B_ID,
      classCode: 'FE002',
      courseId: COURSE_ID,
      teacherId: TEACHER_ID,
      startDate: new Date(today.getTime() - 15 * 86400000),
      maxStudents: 25,
      roomCode: 'P101'
    }
  });
  await prisma.class.upsert({
    where: { classId: CLASS_C_ID },
    update: {},
    create: {
      classId: CLASS_C_ID,
      classCode: 'BE001',
      courseId: COURSE2_ID,
      teacherId: TEACHER2_ID,
      startDate: new Date(today.getTime() - 20 * 86400000),
      maxStudents: 15,
      roomCode: 'P101'
    }
  });

  // ── 5. Schedule Sessions ──────────────────────────────────
  const studyDates = [
    new Date(today.getTime() - 25 * 86400000),
    new Date(today.getTime() - 20 * 86400000),
    new Date(today.getTime() - 15 * 86400000)
  ];

  await prisma.scheduleSession.upsert({
    where: { sessionId: SESSION_A1_ID },
    update: {},
    create: {
      sessionId: SESSION_A1_ID,
      classId: CLASS_A_ID,
      shiftCode: 'MORNING',
      studyDate: studyDates[0],
      status: 'ENDED'
    }
  });
  await prisma.scheduleSession.upsert({
    where: { sessionId: SESSION_A2_ID },
    update: {},
    create: {
      sessionId: SESSION_A2_ID,
      classId: CLASS_A_ID,
      shiftCode: 'MORNING',
      studyDate: studyDates[1],
      status: 'ENDED'
    }
  });
  await prisma.scheduleSession.upsert({
    where: { sessionId: SESSION_A3_ID },
    update: {},
    create: {
      sessionId: SESSION_A3_ID,
      classId: CLASS_A_ID,
      shiftCode: 'MORNING',
      studyDate: studyDates[2],
      status: 'IN_PROGRESS'
    }
  });
  await prisma.scheduleSession.upsert({
    where: { sessionId: SESSION_B1_ID },
    update: {},
    create: {
      sessionId: SESSION_B1_ID,
      classId: CLASS_B_ID,
      shiftCode: 'AFTERNOON',
      studyDate: studyDates[0],
      status: 'ENDED'
    }
  });

  // ── 6. Enrollments ────────────────────────────────────────

  await prisma.enrollment.upsert({
    where: { studentId_classId: { studentId: STUDENT_ID, classId: CLASS_A_ID } },
    update: {},
    create: { studentId: STUDENT_ID, classId: CLASS_A_ID, status: 'IN_PROGRESS' }
  });
  await prisma.enrollment.upsert({
    where: { studentId_classId: { studentId: STUDENT2_ID, classId: CLASS_A_ID } },
    update: {},
    create: { studentId: STUDENT2_ID, classId: CLASS_A_ID, status: 'IN_PROGRESS' }
  });
  await prisma.enrollment.upsert({
    where: { studentId_classId: { studentId: STUDENT_ID, classId: CLASS_B_ID } },
    update: {},
    create: { studentId: STUDENT_ID, classId: CLASS_B_ID, status: 'IN_PROGRESS' }
  });
  await prisma.enrollment.upsert({
    where: { studentId_classId: { studentId: STUDENT2_ID, classId: CLASS_C_ID } },
    update: {},
    create: { studentId: STUDENT2_ID, classId: CLASS_C_ID, status: 'IN_PROGRESS' }
  });

  // ── 7. Attendance ─────────────────────────────────────────

  await prisma.attendance.upsert({
    where: { studentId_sessionId: { studentId: STUDENT_ID, sessionId: SESSION_A1_ID } },
    update: {},
    create: { studentId: STUDENT_ID, sessionId: SESSION_A1_ID, status: 'PRESENT' }
  });
  await prisma.attendance.upsert({
    where: { studentId_sessionId: { studentId: STUDENT2_ID, sessionId: SESSION_A1_ID } },
    update: {},
    create: { studentId: STUDENT2_ID, sessionId: SESSION_A1_ID, status: 'LATE' }
  });
  await prisma.attendance.upsert({
    where: { studentId_sessionId: { studentId: STUDENT_ID, sessionId: SESSION_A2_ID } },
    update: {},
    create: { studentId: STUDENT_ID, sessionId: SESSION_A2_ID, status: 'PRESENT' }
  });
  await prisma.attendance.upsert({
    where: { studentId_sessionId: { studentId: STUDENT2_ID, sessionId: SESSION_A2_ID } },
    update: {},
    create: { studentId: STUDENT2_ID, sessionId: SESSION_A2_ID, status: 'ABSENT', note: 'Ốm' }
  });
  await prisma.attendance.upsert({
    where: { studentId_sessionId: { studentId: STUDENT_ID, sessionId: SESSION_A3_ID } },
    update: {},
    create: { studentId: STUDENT_ID, sessionId: SESSION_A3_ID, status: 'PRESENT' }
  });

  // ── 8. Assignment Results ─────────────────────────────────

  await prisma.assignmentResult.upsert({
    where: { sessionId_studentId: { sessionId: SESSION_A1_ID, studentId: STUDENT_ID } },
    update: {},
    create: {
      sessionId: SESSION_A1_ID,
      studentId: STUDENT_ID,
      score: 8.5,
      feedback: 'Tốt',
      gradedById: TEACHER_ID,
      gradedAt: new Date()
    }
  });
  await prisma.assignmentResult.upsert({
    where: { sessionId_studentId: { sessionId: SESSION_A1_ID, studentId: STUDENT2_ID } },
    update: {},
    create: {
      sessionId: SESSION_A1_ID,
      studentId: STUDENT2_ID,
      score: 6.0,
      feedback: 'Cần cố gắng hơn',
      gradedById: TEACHER_ID,
      gradedAt: new Date()
    }
  });
  await prisma.assignmentResult.upsert({
    where: { sessionId_studentId: { sessionId: SESSION_A2_ID, studentId: STUDENT_ID } },
    update: {},
    create: {
      sessionId: SESSION_A2_ID,
      studentId: STUDENT_ID,
      score: 9.0,
      gradedById: TEACHER_ID,
      gradedAt: new Date()
    }
  });
  await prisma.assignmentResult.upsert({
    where: { sessionId_studentId: { sessionId: SESSION_B1_ID, studentId: STUDENT_ID } },
    update: {},
    create: {
      sessionId: SESSION_B1_ID,
      studentId: STUDENT_ID,
      score: 7.5,
      gradedById: TEACHER_ID,
      gradedAt: new Date()
    }
  });

  // ── 9. Feedback ───────────────────────────────────────────

  await prisma.feedback.create({
    data: {
      studentId: STUDENT_ID,
      classId: CLASS_A_ID,
      teacherId: TEACHER_ID,
      content: 'Giáo viên giảng dạy nhiệt tình, dễ hiểu',
      starRating: 5,
      isFeatured: true
    }
  });
  await prisma.feedback.create({
    data: {
      studentId: STUDENT2_ID,
      classId: CLASS_A_ID,
      teacherId: TEACHER_ID,
      content: 'Khóa học bổ ích, kiến thức thực tế',
      starRating: 4,
      isFeatured: true
    }
  });
  await prisma.feedback.create({
    data: {
      studentId: STUDENT_ID,
      classId: CLASS_B_ID,
      teacherId: TEACHER_ID,
      content: 'Mong muốn có thêm bài tập thực hành',
      starRating: 3
    }
  });

  // ── 10. Salary ────────────────────────────────────────────

  await prisma.salary.upsert({
    where: {
      teacherId_salaryDate: { teacherId: TEACHER_ID, salaryDate: new Date(today.getFullYear(), today.getMonth(), 1) }
    },
    update: {},
    create: {
      teacherId: TEACHER_ID,
      salaryDate: new Date(today.getFullYear(), today.getMonth(), 1),
      totalSessions: 10,
      bonus: 500000,
      deduction: 0,
      totalAmount: 5500000
    }
  });
  await prisma.salary.upsert({
    where: {
      teacherId_salaryDate: { teacherId: TEACHER2_ID, salaryDate: new Date(today.getFullYear(), today.getMonth(), 1) }
    },
    update: {},
    create: {
      teacherId: TEACHER2_ID,
      salaryDate: new Date(today.getFullYear(), today.getMonth(), 1),
      totalSessions: 8,
      bonus: 200000,
      deduction: 100000,
      totalAmount: 3700000
    }
  });
  await prisma.salary.upsert({
    where: {
      teacherId_salaryDate: { teacherId: TEACHER3_ID, salaryDate: new Date(today.getFullYear(), today.getMonth(), 1) }
    },
    update: {},
    create: {
      teacherId: TEACHER3_ID,
      salaryDate: new Date(today.getFullYear(), today.getMonth(), 1),
      totalSessions: 5,
      bonus: 0,
      deduction: 0,
      totalAmount: 2000000
    }
  });

  // ── 11. Requests ──────────────────────────────────────────

  // Leave request (student1)
  const enrollmentA = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId: STUDENT_ID, classId: CLASS_A_ID } }
  });
  if (enrollmentA) {
    await prisma.request.create({
      data: {
        type: 'LEAVE_REQUEST',
        senderAccountId: STUDENT_ACCOUNT_ID,
        reason: 'Bận việc gia đình, cần bảo lưu 1 tháng',
        status: 'PENDING',
        enrollmentId: enrollmentA.enrollmentId,
        leaveStartDate: new Date(today.getTime() + 7 * 86400000),
        leaveEndDate: new Date(today.getTime() + 37 * 86400000),
        progressAtRequest: 40
      }
    });
  }

  // Transfer request (student2)
  await prisma.request.create({
    data: {
      type: 'TRANSFER_REQUEST',
      senderAccountId: STUDENT2_ACCOUNT_ID,
      reason: 'Muốn chuyển sang lớp học tối để đi làm thêm',
      status: 'PENDING',
      fromClassId: CLASS_C_ID,
      toClassId: CLASS_A_ID
    }
  });

  // Schedule change request (teacher1)
  await prisma.request.create({
    data: {
      type: 'SCHEDULE_CHANGE',
      senderAccountId: TEACHER_ACCOUNT_ID,
      reason: 'Bận họp đột xuất, xin dời lịch',
      status: 'PENDING',
      sessionId: SESSION_A3_ID,
      proposedShiftCode: 'AFTERNOON',
      proposedStudyDate: new Date(today.getTime() + 3 * 86400000)
    }
  });

  // Salary complaint (teacher3)
  const salary3 = await prisma.salary.findFirst({ where: { teacherId: TEACHER3_ID } });
  if (salary3) {
    await prisma.request.create({
      data: {
        type: 'SALARY_COMPLAINT',
        senderAccountId: TEACHER3_ACCOUNT_ID,
        reason: 'Số buổi tính thiếu, đề nghị kiểm tra lại',
        status: 'PENDING',
        salaryId: salary3.salaryId,
        proposedAmount: 2500000
      }
    });
  }

  // ── 12. Invoice ───────────────────────────────────────────

  await prisma.invoice.upsert({
    where: { transactionId: 'TXN001' },
    update: {},
    create: { studentId: STUDENT_ID, classId: CLASS_A_ID, amount: 5000000, transactionId: 'TXN001', status: 'PAID' }
  });
  await prisma.invoice.upsert({
    where: { transactionId: 'TXN002' },
    update: {},
    create: { studentId: STUDENT2_ID, classId: CLASS_A_ID, amount: 5000000, transactionId: 'TXN002', status: 'PENDING' }
  });
  await prisma.invoice.upsert({
    where: { transactionId: 'TXN003' },
    update: {},
    create: { studentId: STUDENT_ID, classId: CLASS_B_ID, amount: 5000000, transactionId: 'TXN003', status: 'PAID' }
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
