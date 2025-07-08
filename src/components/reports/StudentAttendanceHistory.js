// src/components/reports/StudentAttendanceHistory.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiService from '../../api/apiService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const StudentAttendanceHistory = () => {
  const { user } = useAuth();
  const [targetStudentId, setTargetStudentId] = useState(''); // For admin/teacher input
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null); // { student_name, records: [{ date, status, remarks, class_name }] }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine effective student ID: from input or logged-in user
  const effectiveStudentId = user?.userType === 'student' ? user.userId : // Assuming userId is student_id for student users
                             user?.userType === 'parent' ? user.childStudentId : // Assuming parent user object has childStudentId
                             targetStudentId;

  // Effect to auto-set student ID for student/parent if not already set by input
  useEffect(() => {
    if (user?.userType === 'student' && user.userId) {
        // No need to setTargetStudentId, effectiveStudentId handles it
    } else if (user?.userType === 'parent' && user.childStudentId) {
        // If parent has one child, could auto-set. If multiple, they might need to select.
        // For now, assume one child or this report is accessed via a specific child's context.
        // No need to setTargetStudentId, effectiveStudentId handles it
    }
  }, [user]);


  const handleGenerateReport = async () => {
    if (!effectiveStudentId) {
      setError('Student ID is required. Please enter a student ID or ensure you are logged in as a student/parent with associated student data.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select both a start and end date.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReportData(null);

    const params = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    };

    try {
      // Conceptual endpoint: GET /api/reports/student/{student_id}/attendance-history
      // Response: { student_name, records: [{ date, status, remarks, class_name (if available) }] }
      const data = await apiService.get(`/reports/student/${effectiveStudentId}/attendance-history`, { params });
      setReportData(data);
    } catch (err)      {
      setError(err.data?.message || err.message || `Failed to generate attendance history for student ID ${effectiveStudentId}.`);
      console.error("Student attendance history error:", err);
    }
    setIsLoading(false);
  };

  // Access: Admin, Teacher, Student, Parent
  // ProtectedRoute in App.js handles the general access. Here we mostly adapt UI.
  const canSpecifyStudentId = ['admin', 'teacher'].includes(user?.userType);

  return (
    <div className="report-container">
      <h3>Student Attendance History</h3>
      <p>Shows a detailed day-by-day attendance record for a specific student over a period.</p>

      {error && <ErrorMessage message={error} />}

      <div className="report-filters">
        {canSpecifyStudentId && (
          <div className="form-group">
            <label htmlFor="targetStudentIdSah">Student ID:</label>
            <input
              type="text"
              id="targetStudentIdSah"
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              placeholder="Enter Student ID"
              disabled={isLoading}
            />
          </div>
        )}
        {!canSpecifyStudentId && user?.userType === 'student' && (
            <p>Showing history for: <strong>{user.name || `Student ID ${user.userId}`}</strong></p>
        )}
        {!canSpecifyStudentId && user?.userType === 'parent' && user.childStudentId && (
            <p>Showing history for child: <strong>{`Student ID ${user.childStudentId}`}</strong> (Name might be available via user object)</p>
        )}
         {!canSpecifyStudentId && user?.userType === 'parent' && !user.childStudentId && (
            <ErrorMessage message="Child student ID not found. Please contact admin."/>
        )}


        <div className="form-group">
          <label htmlFor="startDateSah">Start Date:</label>
          <DatePicker
            id="startDateSah"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDateSah">End Date:</label>
          <DatePicker
            id="endDateSah"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleGenerateReport} disabled={isLoading || !effectiveStudentId || !startDate || !endDate}>
          {isLoading ? <LoadingSpinner size="20px" /> : 'Generate Report'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {reportData && !isLoading && (
        <div className="report-results" style={{ marginTop: '20px' }}>
          <h4>Attendance History for {reportData.student_name || `Student ID ${effectiveStudentId}`}</h4>
          <p>Period: {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}</p>
          {reportData.records && reportData.records.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Class (if available)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reportData.records.map((record, index) => (
                  <tr key={record.date + '-' + index}> {/* Use index if dates can repeat or no unique ID */}
                    <td>{new Date(record.date + 'T00:00:00').toLocaleDateString()}</td>
                    <td>{record.status}</td>
                    <td>{record.class_name || 'N/A'}</td>
                    <td>{record.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No attendance records found for this student in the selected period.</p>
          )}
        </div>
      )}
       {!reportData && !isLoading && !error && <p style={{ marginTop: '20px' }}>{(canSpecifyStudentId && !targetStudentId) ? 'Enter Student ID, ' : ''}Select dates and click "Generate Report" to view data.</p>}
    </div>
  );
};

export default StudentAttendanceHistory;
