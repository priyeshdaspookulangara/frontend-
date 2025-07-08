// src/components/reports/ClassAttendanceRegister.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiService from '../../api/apiService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const ClassAttendanceRegister = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null); // { students: [{ student_id, name, dates: {'YYYY-MM-DD': 'P/A/L', ...} }], date_headers: ['YYYY-MM-DD', ...] }
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
        // If user is a teacher, pre-select their class if possible (logic depends on API/user object)
        // For now, admin/teacher selects from list.
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
      // Conceptual endpoint: GET /api/reports/class/{class_id}/attendance-register
      // Response: { students: [{ student_id, name, attendance: {'2023-01-01': 'P', '2023-01-02': 'A'} }], date_headers: ['2023-01-01', '2023-01-02'] }
      const data = await apiService.get(`/reports/class/${selectedClass}/attendance-register`, { params });
      setReportData(data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to generate class attendance register.');
      console.error("Class attendance register error:", err);
    }
    setIsLoading(false);
  };

  // Access: Admin or Teacher
  if (!user || !['admin', 'teacher'].includes(user.userType)) {
    return <ErrorMessage message="Access Denied: This report is for administrators or teachers only." />;
  }

  return (
    <div className="report-container">
      <h3>Class Attendance Register</h3>
      <p>Displays a daily attendance register for a selected class over a period.</p>

      {error && <ErrorMessage message={error} />}

      <div className="report-filters">
        <div className="form-group">
          <label htmlFor="classSelectCar">Class:</label>
          {isLoadingClasses ? <LoadingSpinner size="20px" /> : (
            <select
              id="classSelectCar"
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
          <label htmlFor="startDateCar">Start Date:</label>
          <DatePicker
            id="startDateCar"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDateCar">End Date:</label>
          <DatePicker
            id="endDateCar"
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
        <div className="report-results" style={{ marginTop: '20px', overflowX: 'auto' }}>
          <h4>Attendance Register for Class {classes.find(c=>c.class_id === parseInt(selectedClass))?.name} ({startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()})</h4>
          {reportData.students && reportData.students.length > 0 && reportData.date_headers && reportData.date_headers.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  {reportData.date_headers.map(date => (
                    <th key={date} style={{minWidth: '60px', textAlign:'center'}}>{new Date(date + 'T00:00:00').toLocaleDateString(undefined, {day:'numeric', month:'short'})}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.students.map(student => (
                  <tr key={student.student_id}>
                    <td>{student.name}</td>
                    {reportData.date_headers.map(date => (
                      <td key={`${student.student_id}-${date}`} style={{textAlign:'center'}}>
                        {student.attendance[date] || '-'} {/* P, A, L, E or '-' if no record */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No attendance data found for the selected criteria, or data format is unexpected.</p>
          )}
        </div>
      )}
      {!reportData && !isLoading && !error && <p style={{ marginTop: '20px' }}>Select parameters and click "Generate Report" to view data.</p>}
    </div>
  );
};

export default ClassAttendanceRegister;
