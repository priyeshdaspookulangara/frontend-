// src/components/reports/NotificationLog.js
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import apiService from '../../api/apiService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const NotificationLog = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [channel, setChannel] = useState(''); // 'sms', 'whatsapp', or '' for all
  const [reportData, setReportData] = useState(null); // Expecting an array of log entries
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
    if (channel) {
      params.channel = channel;
    }

    try {
      // Conceptual endpoint: GET /api/reports/admin/notification-log
      // Response: { logs: [{ log_id, timestamp, student_name, class_name, channel, message_type, status, details }, ...] }
      const data = await apiService.get('/reports/admin/notification-log', { params });
      setReportData(data.logs || []);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to generate notification log.');
      console.error("Notification log error:", err);
    }
    setIsLoading(false);
  };

  // Admin access only for this report
  if (user?.userType !== 'admin') {
    return <ErrorMessage message="Access Denied: This report is for administrators only." />;
  }

  return (
    <div className="report-container">
      <h3>Notification Log</h3>
      <p>Displays a log of all notifications (SMS, WhatsApp) sent from the system.</p>

      {error && <ErrorMessage message={error} />}

      <div className="report-filters">
        <div className="form-group">
          <label htmlFor="startDateNl">Start Date:</label>
          <DatePicker
            id="startDateNl"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDateNl">End Date:</label>
          <DatePicker
            id="endDateNl"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="channel">Channel:</label>
          <select
            id="channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Channels</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <button onClick={handleGenerateReport} disabled={isLoading || !startDate || !endDate}>
          {isLoading ? <LoadingSpinner size="20px" /> : 'Generate Report'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {reportData && !isLoading && (
        <div className="report-results" style={{ marginTop: '20px' }}>
          <h4>Notification Log from {startDate?.toLocaleDateString()} to {endDate?.toLocaleDateString()} {channel && `(Channel: ${channel.toUpperCase()})`}</h4>
          {reportData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Channel</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Details/Message Snippet</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(log => (
                  <tr key={log.log_id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.student_name || 'N/A'}</td>
                    <td>{log.class_name || 'N/A'}</td>
                    <td>{log.channel}</td>
                    <td>{log.message_type}</td> {/* e.g., 'daily_absent', 'threshold_alert' */}
                    <td>{log.status}</td> {/* e.g., 'sent', 'failed', 'delivered' */}
                    <td title={log.details}>{log.details?.substring(0,50)}{log.details && log.details.length > 50 ? '...' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No notification logs found matching the criteria.</p>
          )}
        </div>
      )}
      {!reportData && !isLoading && !error && <p style={{ marginTop: '20px' }}>Select parameters and click "Generate Report" to view data.</p>}
    </div>
  );
};

export default NotificationLog;
