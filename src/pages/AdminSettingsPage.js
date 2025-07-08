// src/pages/AdminSettingsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../api/apiService';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminSettingsPage = () => {
  const { user } = useAuth(); // For role check, though ProtectedRoute handles primary access
  const [settings, setSettings] = useState({
    daily_absent_sms_template: '',
    daily_absent_whatsapp_template: '',
    threshold_alert_sms_template: '',
    threshold_alert_whatsapp_template: '',
    school_phone: '',
    default_comm_channel: 'none', // sms, whatsapp, both, none
    absent_threshold_count: 3, // Default value
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggeringAlerts, setIsTriggeringAlerts] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // Conceptual endpoint: GET /api/admin/sms_settings
      const currentSettings = await apiService.get('/admin/sms_settings');
      if (currentSettings) {
        setSettings(prev => ({ ...prev, ...currentSettings }));
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to fetch admin settings.');
      console.error("Fetch settings error:", err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      // Conceptual endpoint: POST /api/admin/sms_settings
      await apiService.post('/admin/sms_settings', settings);
      setSuccessMessage('Settings saved successfully!');
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to save settings.');
      console.error("Save settings error:", err);
    }
    setIsSaving(false);
  };

  const handleTriggerThresholdAlerts = async () => {
    if (!window.confirm("Are you sure you want to trigger threshold alerts? This may send many messages.")) {
        return;
    }
    setIsTriggeringAlerts(true);
    setError('');
    setSuccessMessage('');
    try {
      // Conceptual endpoint: POST /api/sms/send-threshold-alerts
      const response = await apiService.post('/sms/send-threshold-alerts', {});
      setSuccessMessage(response.message || 'Threshold alerts triggered successfully (or process initiated).');
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to trigger threshold alerts.');
      console.error("Trigger alerts error:", err);
    }
    setIsTriggeringAlerts(false);
  };

  // Authorization check (primarily handled by ProtectedRoute)
  if (user && user.userType !== 'admin') {
    return <div className="container"><ErrorMessage message="You are not authorized to view this page." /></div>;
  }

  if (isLoading) {
    return <div className="container"><LoadingSpinner /></div>;
  }

  return (
    <div className="container page-container">
      <h1>Admin Settings - Communication</h1>
      {error && <ErrorMessage message={error} />}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSaveSettings}>
        <h3>Message Templates</h3>
        <p>Use placeholders like `{{student_name}}`, `{{class_name}}`, `{{date}}`, `{{absent_count}}`, `{{school_name}}` in templates where applicable.</p>

        <div className="form-group">
          <label htmlFor="daily_absent_sms_template">Daily Absent SMS Template:</label>
          <textarea
            id="daily_absent_sms_template"
            name="daily_absent_sms_template"
            value={settings.daily_absent_sms_template}
            onChange={handleChange}
            rows="3"
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="daily_absent_whatsapp_template">Daily Absent WhatsApp Template:</label>
          <textarea
            id="daily_absent_whatsapp_template"
            name="daily_absent_whatsapp_template"
            value={settings.daily_absent_whatsapp_template}
            onChange={handleChange}
            rows="3"
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="threshold_alert_sms_template">Chronic Absence SMS Template (Threshold Alert):</label>
          <textarea
            id="threshold_alert_sms_template"
            name="threshold_alert_sms_template"
            value={settings.threshold_alert_sms_template}
            onChange={handleChange}
            rows="3"
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="threshold_alert_whatsapp_template">Chronic Absence WhatsApp Template (Threshold Alert):</label>
          <textarea
            id="threshold_alert_whatsapp_template"
            name="threshold_alert_whatsapp_template"
            value={settings.threshold_alert_whatsapp_template}
            onChange={handleChange}
            rows="3"
            disabled={isSaving}
          />
        </div>

        <h3>General Settings</h3>
        <div className="form-group">
          <label htmlFor="school_phone">School Phone Number (for SMS sender ID/WhatsApp):</label>
          <input
            type="text"
            id="school_phone"
            name="school_phone"
            value={settings.school_phone}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="default_comm_channel">Default Communication Channel (when marking attendance):</label>
          <select
            id="default_comm_channel"
            name="default_comm_channel"
            value={settings.default_comm_channel}
            onChange={handleChange}
            disabled={isSaving}
          >
            <option value="none">None</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="both">Both SMS & WhatsApp</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="absent_threshold_count">Absent Threshold Count (for chronic absenteeism alerts):</label>
          <input
            type="number"
            id="absent_threshold_count"
            name="absent_threshold_count"
            value={settings.absent_threshold_count}
            onChange={handleChange}
            min="1"
            disabled={isSaving}
          />
        </div>

        <button type="submit" disabled={isSaving || isLoading}>
          {isSaving ? <LoadingSpinner /> : 'Save Settings'}
        </button>
      </form>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
        <h3>Manual Actions</h3>
        <button
            onClick={handleTriggerThresholdAlerts}
            disabled={isTriggeringAlerts || isSaving}
            style={{ backgroundColor: '#f0ad4e', color: 'white' }}
        >
          {isTriggeringAlerts ? <LoadingSpinner /> : 'Trigger Chronic Absenteeism Alerts Now'}
        </button>
        <p style={{fontSize: '0.9em', color: '#666'}}>This will check for students meeting the "Absent Threshold Count" and send alerts if not already sent recently.</p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
