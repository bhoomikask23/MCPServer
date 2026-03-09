import { useState } from 'react'
import './App.css'
import HealthCard from './components/HealthCard'

const patients = [
  {
    id: 'HC-2024-001',
    name: 'Sarah Johnson',
    age: 34,
    gender: 'Female',
    bloodType: 'O+',
    dob: '1991-06-15',
    phone: '(555) 123-4567',
    emergencyContact: 'Mark Johnson - (555) 987-6543',
    insurance: 'BlueCross Shield - PPO',
    policyNumber: 'BCS-88421903',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: ['Asthma', 'Seasonal Allergies'],
    medications: ['Albuterol Inhaler', 'Cetirizine 10mg'],
    vitals: {
      heartRate: 72,
      bloodPressure: '118/76',
      temperature: 98.4,
      oxygenSat: 98,
    },
    lastVisit: '2024-11-20',
  },
  {
    id: 'HC-2024-002',
    name: 'Jamesxws',
    age: 58,
    gender: 'Male',
    bloodType: 'A-',
    dob: '1967-03-22',
    phone: '(555) 234-5678',
    emergencyContact: 'Linda Rivera - (555) 876-5432',
    insurance: 'Aetna - HMO',
    policyNumber: 'AET-55198274',
    allergies: ['Sulfa Drugs'],
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Aspirin 81mg'],
    vitals: {
      heartRate: 80,
      bloodPressure: '134/88',
      temperature: 98.6,
      oxygenSat: 96,
    },
    lastVisit: '2024-12-05',
  },
  {
    id: 'HC-2024-003',
    name: 'Emily Chen',
    age: 27,
    gender: 'Female',
    bloodType: 'B+',
    dob: '1998-09-08',
    phone: '(555) 345-6789',
    emergencyContact: 'Wei Chen - (555) 765-4321',
    insurance: 'UnitedHealth - EPO',
    policyNumber: 'UHC-33047561',
    allergies: [],
    conditions: ['Migraine'],
    medications: ['Sumatriptan 50mg (as needed)'],
    vitals: {
      heartRate: 68,
      bloodPressure: '110/70',
      temperature: 98.2,
      oxygenSat: 99,
    },
    lastVisit: '2025-01-10',
  },
]

function App() {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>HealthCard</h1>
        <p>Patient Health Card Portal</p>
      </header>

      <div style={{ maxWidth: 400, margin: '0 auto 2rem' }}>
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#0d9488')}
          onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
        />
      </div>

      <div className="cards-grid">
        {filtered.map((patient) => (
          <HealthCard key={patient.id} patient={patient} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
          No patients found.
        </p>
      )}
    </div>
  )
}

export default App
