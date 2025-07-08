// src/components/reports/StudentAttendanceSummary.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiService from '../../api/apiService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const StudentAttendanceSummary = () => {
  const { user } = useAuth();
  const [targetStudentId, setTargetStudentId] = useState(''); // For admin/teacher input
  const [academicYearStartDate, setAcademicYearStartDate] = useState(getAcademicYearStartDefault()); // Default to current academic year start
  const [reportData, setReportData] = useState(null); // { student_name, total_days, present_days, absent_days, late_days, percentage }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to get a sensible default for academic year start date (e.g., Aug 1st of current/previous year)
  function getAcademicYearStartDefault() {
    const today = new Date();
    let year = today.getFullYear();
    // Assuming academic year starts around August. If current month is before August, use previous year's August.
    if (today.getMonth() < 7) { // Month is 0-indexed, 7 is August
      year -= 1;
    }
    return new Date(year, 7, 1); // August 1st
  }

  // Determine effective student ID
  const effectiveStudentId = user?.userType === 'student' ? user.userId :
                             user?.userType === 'parent' ? user.childStudentId :
                             targetStudentId;

  useEffect(() => {
    // Pre-fill logic similar to StudentAttendanceHistory if needed, handled by effectiveStudentId for now.
  }, [user]);

  const handleGenerateReport = async () => {
    if (!effectiveStudentId) {
      setError('Student ID is required.');
      return;
    }
    if (!academicYearStartDate) {
      setError('Academic year start date is required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReportData(null);

    const params = {
      academic_year_start_date: academicYearStartDate.toISOString().split('T')[0],
    };

    try {
      // Conceptual endpoint: GET /api/reports/student/{student_id}/attendance-summary
      // Response: { student_name, total_school_days, present_days, absent_days, late_days, attendance_percentage }
      const data = await apiService.get(`/reports/student/${effectiveStudentId}/attendance-summary`, { params });
      setReportData(data);
    } catch (err) {
      setError(err.data?.message || err.message || `Failed to generate attendance summary for student ID ${effectiveStudentId}.`);
      console.error("Student attendance summary error:", err);
    }
    setIsLoading(false);
  };

  const canSpecifyStudentId = ['admin', 'teacher'].includes(user?.userType);

  return (
    <div className="report-container">
      <h3>Student Attendance Summary</h3>
      <p>Provides an overall attendance summary for a student since the start of an academic year.</p>

      {error && <ErrorMessage message={error} />}

      <div className="report-filters">
        {canSpecifyStudentId && (
          <div className="form-group">
            <label htmlFor="targetStudentIdSas">Student ID:</label>
            <input
              type="text"
              id="targetStudentIdSas"
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              placeholder="Enter Student ID"
              disabled={isLoading}
            />
          </div>
        )}
        {!canSpecifyStudentId && user?.userType === 'student' && (
            <p>Showing summary for: <strong>{user.name || `Student ID ${user.userId}`}</strong></p>
        )}
        {!canSpecifyStudentId && user?.userType === 'parent' && user.childStudentId && (
            <p>Showing summary for child: <strong>{`Student ID ${user.childStudentId}`}</strong></p>
        )}
        {!canSpecifyStudentId && user?.userType === 'parent' && !user.childStudentId && (
            <ErrorMessage message="Child student ID not found. Please contact admin."/>
        )}


        <div className="form-group">
          <label htmlFor="academicYearStartDate">Academic Year Start Date:</label>
          <DatePicker
            id="academicYearStartDate"
            selected={academicYearStartDate}
            onChange={(date) => setAcademicYearStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select academic year start"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleGenerateReport} disabled={isLoading || !effectiveStudentId || !academicYearStartDate}>
          {isLoading ? <LoadingSpinner size="20px" /> : 'Generate Report'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {reportData && !isLoading && (
        <div className="report-results" style={{ marginTop: '20px' }}>
          <h4>Attendance Summary for {reportData.student_name || `Student ID ${effectiveStudentId}`}</h4>
          <p>Since Academic Year Start: {academicYearStartDate?.toLocaleDateString()}</p>
          <ul>
            <li><strong>Total School Days Attended:</strong> {reportData.present_days ?? 'N/A'}</li>
            <li><strong>Total School Days Absent:</strong> {reportData.absent_days ?? 'N/A'}</li>
            <li><strong>Total Late Arrivals:</strong> {reportData.late_days ?? 'N/A'}</li>
            <li><strong>Total Possible School Days (in period):</strong> {reportData.total_school_days ?? 'N/A'}</li>
            <li><strong>Overall Attendance Percentage:</strong> {reportData.attendance_percentage?.toFixed(2) ?? 'N/A'}%</li>
          </ul>
        </div>
      )}
      {!reportData && !isLoading && !error && <p style={{ marginTop: '20px' }}>{(canSpecifyStudentId && !targetStudentId) ? 'Enter Student ID, ' : ''}Select academic year start date and click "Generate Report".</p>}
    </div>
  );
};

export default StudentAttendanceSummary;
