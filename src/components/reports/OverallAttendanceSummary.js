// src/components/reports/OverallAttendanceSummary.js
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiService from '../../api/apiService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const OverallAttendanceSummary = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
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
      // Conceptual endpoint: GET /api/reports/admin/overall-attendance-summary
      const data = await apiService.get('/reports/admin/overall-attendance-summary', { params });
      setReportData(data); // Assuming data is { overall_average_attendance: 75.5, total_absences: 120, total_present: 880, ... }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to generate overall attendance summary.');
      console.error("Overall attendance summary error:", err);
    }
    setIsLoading(false);
  };

  // Admin access only for this report
  if (user?.userType !== 'admin') {
    return <ErrorMessage message="Access Denied: This report is for administrators only." />;
  }

  return (
    <div className="report-container">
      <h3>Overall Attendance Summary</h3>
      <p>Provides a summary of attendance across the entire school for a selected period.</p>

      {error && <ErrorMessage message={error} />}

      <div className="report-filters">
        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <DatePicker
            id="endDate"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleGenerateReport} disabled={isLoading || !startDate || !endDate}>
          {isLoading ? <LoadingSpinner size="20px" /> : 'Generate Report'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {reportData && !isLoading && (
        <div className="report-results" style={{ marginTop: '20px' }}>
          <h4>Report for {startDate?.toLocaleDateString()} to {endDate?.toLocaleDateString()}</h4>
          {/* Example: Displaying some summary data. Adjust based on actual API response structure */}
          <p><strong>Overall Average Attendance:</strong> {reportData.overall_average_attendance?.toFixed(2) ?? 'N/A'}%</p>
          <p><strong>Total Students Present:</strong> {reportData.total_present ?? 'N/A'}</p>
          <p><strong>Total Students Absent:</strong> {reportData.total_absences ?? 'N/A'}</p>
          <p><strong>Total Late Arrivals:</strong> {reportData.total_late ?? 'N/A'}</p>
          {/* You might have more detailed data to display, perhaps in a table or list */}
          {reportData.class_breakdown && (
            <>
              <h5>Attendance by Class:</h5>
              <table>
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Average Attendance (%)</th>
                    <th>Total Absences</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.class_breakdown.map(cls => (
                    <tr key={cls.class_id}>
                      <td>{cls.class_name}</td>
                      <td>{cls.average_attendance?.toFixed(2) ?? 'N/A'}%</td>
                      <td>{cls.total_absences ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
      {!reportData && !isLoading && !error && <p style={{ marginTop: '20px' }}>Select dates and click "Generate Report" to view data.</p>}
    </div>
  );
};

export default OverallAttendanceSummary;
