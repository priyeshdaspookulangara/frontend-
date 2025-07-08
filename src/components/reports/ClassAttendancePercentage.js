// src/components/reports/ClassAttendancePercentage.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiService from '../../api/apiService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const ClassAttendancePercentage = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null); // { class_name, overall_percentage, student_percentages: [{student_id, name, percentage}] }
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [error, setError] = useState('');

  // Fetch classes
  useEffect(() => {
    const fetchClassesData = async () => {
      setIsLoadingClasses(true);
      try {
        const data = await apiService.get('/classes'); // Conceptual: /api/classes
        setClasses(data || []);
      } catch (err) {
        setError(err.data?.message || err.message || 'Failed to fetch classes.');
      }
      setIsLoadingClasses(false);
    };
    if (user?.userType === 'admin' || user?.userType === 'teacher') {
      fetchClassesData();
    }
  }, [user?.userType]);

  const handleGenerateReport = async () => {
    if (!selectedClass || !startDate || !endDate) {
      setError('Please select a class, start date, and end date.');
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
      // Conceptual endpoint: GET /api/reports/class/{class_id}/attendance-percentage
      // Response: { class_name, overall_percentage, student_percentages: [{student_id, name, present_days, total_days, percentage}] }
      const data = await apiService.get(`/reports/class/${selectedClass}/attendance-percentage`, { params });
      setReportData(data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to generate class attendance percentage.');
      console.error("Class attendance percentage error:", err);
    }
    setIsLoading(false);
  };

  // Access: Admin or Teacher
  if (!user || !['admin', 'teacher'].includes(user.userType)) {
    return <ErrorMessage message="Access Denied: This report is for administrators or teachers only." />;
  }

  return (
    <div className="report-container">
      <h3>Class Attendance Percentage</h3>
      <p>Calculates and displays the attendance percentage for a selected class and its students over a period.</p>

      {error && <ErrorMessage message={error} />}

      <div className="report-filters">
        <div className="form-group">
          <label htmlFor="classSelectCap">Class:</label>
          {isLoadingClasses ? <LoadingSpinner size="20px" /> : (
            <select
              id="classSelectCap"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isLoading || isLoadingClasses}
            >
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id}>{cls.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="startDateCap">Start Date:</label>
          <DatePicker
            id="startDateCap"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDateCap">End Date:</label>
          <DatePicker
            id="endDateCap"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleGenerateReport} disabled={isLoading || !selectedClass || !startDate || !endDate}>
          {isLoading ? <LoadingSpinner size="20px" /> : 'Generate Report'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {reportData && !isLoading && (
        <div className="report-results" style={{ marginTop: '20px' }}>
          <h4>Attendance Percentage for {reportData.class_name || classes.find(c=>c.class_id === parseInt(selectedClass))?.name}</h4>
          <p><strong>Overall Class Attendance: {reportData.overall_percentage?.toFixed(2) ?? 'N/A'}%</strong> (Period: {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()})</p>

          {reportData.student_percentages && reportData.student_percentages.length > 0 ? (
            <>
              <h5>Student Breakdown:</h5>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Present Days</th>
                    <th>Total School Days</th>
                    <th>Attendance (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.student_percentages.map(student => (
                    <tr key={student.student_id}>
                      <td>{student.name}</td>
                      <td>{student.present_days ?? 'N/A'}</td>
                      <td>{student.total_days ?? 'N/A'}</td>
                      <td>{student.percentage?.toFixed(2) ?? 'N/A'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>No student percentage data available for this class and period.</p>
          )}
        </div>
      )}
      {!reportData && !isLoading && !error && <p style={{ marginTop: '20px' }}>Select parameters and click "Generate Report" to view data.</p>}
    </div>
  );
};

export default ClassAttendancePercentage;
