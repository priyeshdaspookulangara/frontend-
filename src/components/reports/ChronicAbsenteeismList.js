// src/components/reports/ChronicAbsenteeismList.js
import React, { useState } from 'react';
import apiService from '../../api/apiService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const ChronicAbsenteeismList = () => {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState(5); // Default threshold: 5 days
  const [lookbackDays, setLookbackDays] = useState(30); // Default lookback: 30 days
  const [reportData, setReportData] = useState(null); // Expecting an array of students
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    if (threshold <= 0 || lookbackDays <= 0) {
      setError('Threshold and Lookback Days must be positive numbers.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReportData(null);

    const params = {
      threshold: parseInt(threshold, 10),
      lookback_days: parseInt(lookbackDays, 10),
    };

    try {
      // Conceptual endpoint: GET /api/reports/admin/chronic-absenteeism
      // Response: { students: [{ student_id, name, class_name, absence_count, last_absence_date }, ...] }
      const data = await apiService.get('/reports/admin/chronic-absenteeism', { params });
      setReportData(data.students || []);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to generate chronic absenteeism list.');
      console.error("Chronic absenteeism error:", err);
    }
    setIsLoading(false);
  };

  // Admin access only for this report
  if (user?.userType !== 'admin') {
    return <ErrorMessage message="Access Denied: This report is for administrators only." />;
  }

  return (
    <div className="report-container">
      <h3>Chronic Absenteeism List</h3>
      <p>Lists students who have been absent for a specified number of days within a lookback period.</p>

      {error && <ErrorMessage message={error} />}

      <div className="report-filters">
        <div className="form-group">
          <label htmlFor="threshold">Absence Threshold (days):</label>
          <input
            type="number"
            id="threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            min="1"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lookbackDays">Lookback Period (days):</label>
          <input
            type="number"
            id="lookbackDays"
            value={lookbackDays}
            onChange={(e) => setLookbackDays(e.target.value)}
            min="1"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleGenerateReport} disabled={isLoading || threshold <= 0 || lookbackDays <= 0}>
          {isLoading ? <LoadingSpinner size="20px" /> : 'Generate Report'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {reportData && !isLoading && (
        <div className="report-results" style={{ marginTop: '20px' }}>
          <h4>Students Exceeding {threshold} Absences in the Last {lookbackDays} Days</h4>
          {reportData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Class Name</th>
                  <th>Absence Count</th>
                  <th>Last Absence Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(student => (
                  <tr key={student.student_id}>
                    <td>{student.student_id}</td>
                    <td>{student.name}</td>
                    <td>{student.class_name}</td>
                    <td>{student.absence_count}</td>
                    <td>{student.last_absence_date ? new Date(student.last_absence_date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students found matching the criteria.</p>
          )}
        </div>
      )}
       {!reportData && !isLoading && !error && <p style={{ marginTop: '20px' }}>Set parameters and click "Generate Report" to view data.</p>}
    </div>
  );
};

export default ChronicAbsenteeismList;
