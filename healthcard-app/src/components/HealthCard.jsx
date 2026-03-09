import { useState } from 'react'
import './HealthCard.css'

function VitalBadge({ label, value, unit, status }) {
  return (
    <div className={`vital-badge vital-${status}`}>
      <span className="vital-value">{value}</span>
      <span className="vital-unit">{unit}</span>
      <span className="vital-label">{label}</span>
    </div>
  )
}

function getHeartRateStatus(hr) {
  if (hr < 60 || hr > 100) return 'warning'
  return 'normal'
}

function getBpStatus(bp) {
  const systolic = parseInt(bp.split('/')[0])
  if (systolic >= 140) return 'warning'
  if (systolic >= 130) return 'caution'
  return 'normal'
}

function getO2Status(o2) {
  if (o2 < 95) return 'warning'
  return 'normal'
}

function HealthCard({ patient }) {
  const [expanded, setExpanded] = useState(false)

  const {
    id, name, age, gender, bloodType, dob, phone,
    emergencyContact, insurance, policyNumber,
    allergies, conditions, medications, vitals, lastVisit,
  } = patient

  return (
    <div className="health-card">
      <div className="card-top">
        <div className="card-id">{id}</div>
        <div className="blood-type">{bloodType}</div>
      </div>

      <div className="card-patient">
        <div className="avatar">
          {name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <h2 className="patient-name">{name}</h2>
          <p className="patient-meta">
            {age} yrs &middot; {gender} &middot; DOB: {dob}
          </p>
        </div>
      </div>

      <div className="vitals-row">
        <VitalBadge
          label="Heart Rate"
          value={vitals.heartRate}
          unit="bpm"
          status={getHeartRateStatus(vitals.heartRate)}
        />
        <VitalBadge
          label="Blood Pressure"
          value={vitals.bloodPressure}
          unit="mmHg"
          status={getBpStatus(vitals.bloodPressure)}
        />
        <VitalBadge
          label="Temp"
          value={vitals.temperature}
          unit="°F"
          status="normal"
        />
        <VitalBadge
          label="SpO2"
          value={vitals.oxygenSat}
          unit="%"
          status={getO2Status(vitals.oxygenSat)}
        />
      </div>

      {allergies.length > 0 && (
        <div className="allergy-banner">
          <span className="allergy-icon">!</span>
          Allergies: {allergies.join(', ')}
        </div>
      )}

      <div className="card-section">
        <h3>Conditions</h3>
        <div className="tag-list">
          {conditions.map((c) => (
            <span key={c} className="tag tag-condition">{c}</span>
          ))}
        </div>
      </div>

      <div className="card-section">
        <h3>Medications</h3>
        <div className="tag-list">
          {medications.map((m) => (
            <span key={m} className="tag tag-medication">{m}</span>
          ))}
        </div>
      </div>

      <button
        className="expand-btn"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="details-panel">
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span>{phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Emergency</span>
            <span>{emergencyContact}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Insurance</span>
            <span>{insurance}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Policy #</span>
            <span>{policyNumber}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Visit</span>
            <span>{lastVisit}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthCard
