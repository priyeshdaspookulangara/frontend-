// src/pages/MarkAttendancePage.js
import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiService from '../api/apiService';
import useAuth from '../hooks/useAuth'; // To ensure only admin/teacher can access
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MarkAttendancePage = () => {
  const { user } = useAuth(); // For role checks if needed, though ProtectedRoute handles primary access
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { student_id: { status: 'present', remarks: '' } }
  const [communicationChannel, setCommunicationChannel] = useState('none'); // sms, whatsapp, both, none

  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      setError('');
      try {
        // Conceptual endpoint: GET /api/classes
        const data = await apiService.get('/classes');
        setClasses(data || []); // Assuming data is an array of class objects { class_id, name }
      } catch (err) {
        setError(err.data?.message || err.message || 'Failed to fetch classes.');
        console.error("Fetch classes error:", err);
      }
      setIsLoadingClasses(false);
    };
    fetchClasses();
  }, []);

  // Fetch students when selectedClass changes
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setAttendanceRecords({});
      return;
    }

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setError('');
      setSuccessMessage('');
      try {
        // Conceptual endpoint: GET /api/students?class_id=X
        const data = await apiService.get(`/students?class_id=${selectedClass}`);
        setStudents(data || []); // Assuming data is an array of student objects { student_id, name }
        // Initialize attendance records for fetched students
        const initialRecords = {};
        (data || []).forEach(student => {
          initialRecords[student.student_id] = { status: 'present', remarks: '' };
        });
        setAttendanceRecords(initialRecords);
      } catch (err) {
        setError(err.data?.message || err.message || 'Failed to fetch students for the selected class.');
        console.error("Fetch students error:", err);
        setStudents([]);
        setAttendanceRecords({});
      }
      setIsLoadingStudents(false);
    };

    fetchStudents();
  }, [selectedClass]);

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceRecords(prevRecords => ({
      ...prevRecords,
      [studentId]: {
        ...prevRecords[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || students.length === 0) {
      setError('Please select a class and ensure students are loaded.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      class_id: selectedClass,
      attendance_date: attendanceDate.toISOString().split('T')[0], // YYYY-MM-DD
      comm_channel: communicationChannel,
      records: Object.entries(attendanceRecords).map(([student_id, record]) => ({
        student_id: parseInt(student_id), // Ensure student_id is a number if API expects it
        status: record.status,
        remarks: record.remarks,
      })),
    };

    try {
      // Conceptual endpoint: POST /api/attendance/mark
      await apiService.post('/attendance/mark', payload);
      setSuccessMessage('Attendance marked successfully!');
      // Optionally reset form or parts of it
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to submit attendance.');
      console.error("Submit attendance error:", err);
    }
    setIsSubmitting(false);
  };

  // Authorization check (though ProtectedRoute should handle this)
  if (user && !['admin', 'teacher'].includes(user.userType)) {
    return <div className="container"><ErrorMessage message="You are not authorized to view this page." /></div>;
  }

  return (
    <div className="container page-container">
      <h1>Mark Attendance</h1>
      {error && <ErrorMessage message={error} />}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="classSelect">Select Class:</label>
          {isLoadingClasses ? <LoadingSpinner /> : (
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isLoadingClasses || isSubmitting}
            >
              <option value="">-- Select a Class --</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id}>{cls.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="attendanceDate">Attendance Date:</label>
          <DatePicker
            id="attendanceDate"
            selected={attendanceDate}
            onChange={(date) => setAttendanceDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control" // Ensure styling if needed
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
            <label htmlFor="communicationChannel">Communication Channel for Absentees:</label>
            <select
                id="communicationChannel"
                value={communicationChannel}
                onChange={(e) => setCommunicationChannel(e.target.value)}
                disabled={isSubmitting}
            >
                <option value="none">None</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="both">Both SMS & WhatsApp</option>
            </select>
        </div>


        {isLoadingStudents && <LoadingSpinner />}

        {!isLoadingStudents && students.length > 0 && (
          <>
            <h3>Students List</h3>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.student_id}>
                    <td>{student.name}</td>
                    <td>
                      <label style={{ marginRight: '10px' }}>
                        <input
                          type="radio"
                          name={`status-${student.student_id}`}
                          value="present"
                          checked={attendanceRecords[student.student_id]?.status === 'present'}
                          onChange={() => handleAttendanceChange(student.student_id, 'status', 'present')}
                          disabled={isSubmitting}
                        /> Present
                      </label>
                      <label style={{ marginRight: '10px' }}>
                        <input
                          type="radio"
                          name={`status-${student.student_id}`}
                          value="absent"
                          checked={attendanceRecords[student.student_id]?.status === 'absent'}
                          onChange={() => handleAttendanceChange(student.student_id, 'status', 'absent')}
                          disabled={isSubmitting}
                        /> Absent
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`status-${student.student_id}`}
                          value="late"
                          checked={attendanceRecords[student.student_id]?.status === 'late'}
                          onChange={() => handleAttendanceChange(student.student_id, 'status', 'late')}
                          disabled={isSubmitting}
                        /> Late
                      </label>
                       {/* Add other statuses like 'excused' if needed */}
                    </td>
                    <td>
                      <input
                        type="text"
                        className="remarks-input"
                        value={attendanceRecords[student.student_id]?.remarks || ''}
                        onChange={(e) => handleAttendanceChange(student.student_id, 'remarks', e.target.value)}
                        placeholder="Optional remarks"
                        disabled={isSubmitting}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" disabled={isSubmitting || isLoadingStudents || !selectedClass} style={{ marginTop: '20px' }}>
              {isSubmitting ? <LoadingSpinner /> : 'Submit Attendance'}
            </button>
          </>
        )}
        {!isLoadingStudents && selectedClass && students.length === 0 && <p>No students found for this class or class not selected.</p>}
      </form>
    </div>
  );
};

export default MarkAttendancePage;
