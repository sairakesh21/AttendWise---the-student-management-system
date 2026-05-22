const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark daily attendance for students
// @route   POST /api/attendance
// @access  Private/Teacher
const markAttendance = async (req, res) => {
  const { date, records } = req.body; // date: YYYY-MM-DD, records: [{ studentId, status: 'Present'|'Absent' }]
  const subject = req.user.subject;

  if (!date || !records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Date and records array are required' });
  }

  try {
    const attendanceDate = new Date(date);
    // Set time to midnight UTC/local to normalize
    attendanceDate.setHours(0, 0, 0, 0);

    const promises = records.map(async (record) => {
      return Attendance.findOneAndUpdate(
        {
          student: record.studentId,
          subject: subject,
          date: attendanceDate
        },
        {
          teacher: req.user._id,
          status: record.status
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
    });

    await Promise.all(promises);
    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance report for teacher's subject
// @route   GET /api/attendance/teacher-report
// @access  Private/Teacher
const getTeacherReport = async (req, res) => {
  const subject = req.user.subject;

  try {
    // 1. Get all students
    const students = await User.find({ role: 'student' }).select('name email rollNumber').sort({ name: 1 });
    
    // 2. Get all attendance logs for this subject
    const attendanceLogs = await Attendance.find({ subject });

    // 3. Get unique dates where attendance was marked
    const uniqueDates = await Attendance.distinct('date', { subject });
    // Sort dates ascending
    uniqueDates.sort((a, b) => new Date(a) - new Date(b));

    const totalClasses = uniqueDates.length;

    // 4. Build student report mapping
    const studentReport = students.map((student) => {
      const studentLogs = attendanceLogs.filter(
        log => log.student.toString() === student._id.toString()
      );

      const attended = studentLogs.filter(log => log.status === 'Present').length;
      const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

      // Create a dictionary of date -> status for this student
      const dailyStatus = {};
      studentLogs.forEach(log => {
        const dateStr = new Date(log.date).toISOString().split('T')[0];
        dailyStatus[dateStr] = log.status;
      });

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        attended,
        totalClasses,
        percentage,
        dailyStatus
      };
    });

    res.json({
      subject,
      totalClasses,
      dates: uniqueDates.map(d => new Date(d).toISOString().split('T')[0]),
      students: studentReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance report for logged-in student
// @route   GET /api/attendance/student-report
// @access  Private/Student
const getStudentReport = async (req, res) => {
  const studentId = req.user._id;

  try {
    const logs = await Attendance.find({ student: studentId })
      .populate('teacher', 'name')
      .sort({ date: -1 });

    // Group logs by subject
    const subjectGroups = {};
    logs.forEach(log => {
      if (!subjectGroups[log.subject]) {
        subjectGroups[log.subject] = {
          subject: log.subject,
          teacherName: log.teacher ? log.teacher.name : 'Unknown',
          attended: 0,
          totalClasses: 0,
          history: []
        };
      }
      
      subjectGroups[log.subject].totalClasses += 1;
      if (log.status === 'Present') {
        subjectGroups[log.subject].attended += 1;
      }
      
      subjectGroups[log.subject].history.push({
        date: new Date(log.date).toISOString().split('T')[0],
        status: log.status
      });
    });

    // Convert groups to array and compute percentage
    const report = Object.values(subjectGroups).map(group => {
      group.percentage = group.totalClasses > 0 ? Math.round((group.attended / group.totalClasses) * 100) : 0;
      return group;
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getTeacherReport,
  getStudentReport
};
