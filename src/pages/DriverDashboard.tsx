import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Trip } from '../types/index';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<User | null>(null);
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const [userRes, pendingRes, myTripsRes] = await Promise.all([
        fetch('http://localhost:8080/users/me', { headers }),
        fetch('http://localhost:8080/trips/pending', { headers }),
        fetch('http://localhost:8080/trips/my', { headers })
      ]);

      if (userRes.status === 401) {
        navigate('/auth');
        return;
      }

      if (userRes.ok && pendingRes.ok && myTripsRes.ok) {
        const userData: User = await userRes.json();
        const pendingData: Trip[] = await pendingRes.json();
        const myTripsData: Trip[] = await myTripsRes.json();

        setDriver(userData);
        setPendingTrips(pendingData);

        const inProgressTrip = myTripsData.find(trip => trip.status === 'IN_PROGRESS');
        setActiveTrip(inProgressTrip || null);
      } else {
        setError('Ocurrió un error al cargar la información del dashboard.');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error || "No se pudo cargar la información.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAcceptTrip = async (tripId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/trips/${tripId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchDashboardData();
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.error || 'No se pudo aceptar el viaje. Es posible que ya no estés disponible o el viaje fue tomado.');
      }
     } catch (err: any) {
      const message =
        err.response?.data?.error || "No se pudo cargar la información.";
      alert(message);
    }
  };

  if (loading) return (
    <p style={{ textAlign: 'center' }}>
        Cargando panel de control...
    </p>);
  if (error || !driver) return (
    <p style={{ color: 'red', textAlign: 'center' }}>
        {error}
    </p>);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '10px', borderBottom: '2px solid #eee' }}>
        <div>
          <h2 style={{ margin: 0 }}>Hola, {driver.firstName}</h2>
          <p style={{ margin: '5px 0 0 0', color: '#807d7d' }}>
            Rating actual: <strong>{driver.rating > 0 ? `${driver.rating} ⭐` : 'Sin calificaciones'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '5px 10px',
            borderRadius: '12px',
            background: driver.available ? '#0caf03' : '#ea7e3b',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {driver.available ? 'DISPONIBLE' : 'OCUPADO'}
          </span>
          <button
            onClick={() => navigate('/history')}
            style={{ padding: '10px 20px', background: 'white', color: 'black', border: '1px solid black', cursor: 'pointer' }}
          >
            Ver historial
          </button>
        </div>
      </header>

      {activeTrip && (
        <div style={{ background: '#d6e8da', border: '2px solid #0caf03', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ color: '#0caf03', marginTop: 0 }}> Viaje en Curso</h3>
          <p><strong>Origen:</strong> {activeTrip.pickupAddress}</p>
          <p><strong>Destino:</strong> {activeTrip.dropoffAddress}</p>
          <p><strong>Pasajero:</strong> {activeTrip.passenger.firstName} {activeTrip.passenger.lastName}</p>
          
          <button 
            onClick={() => navigate(`/driver/trips/${activeTrip.id}`)}
            style={{ 
              marginTop: '15px', padding: '10px 20px', background: '#0caf03', 
              color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            Ir a Detalles / Completar Viaje
          </button>
        </div>
      )}

      <h3>Viajes Disponibles (Pendientes)</h3>
      
      {activeTrip ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          Debes completar tu viaje actual antes de poder aceptar nuevos viajes.
        </p>
      ) : pendingTrips.length === 0 ? (
        <p>No hay viajes pendientes en este momento. Sigue esperando...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {pendingTrips.map(trip => (
            <li key={trip.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 5px 0' }}><strong>𝇕 Origen:</strong> {trip.pickupAddress}</p>
                <p style={{ margin: 0 }}><strong>🏳 Destino:</strong> {trip.dropoffAddress}</p>
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Pasajero: {trip.passenger.firstName} {trip.passenger.rating ? `(${trip.passenger.rating}⭐)` : ''}
                </small>
              </div>
              
              <button 
                onClick={() => handleAcceptTrip(trip.id)}
                style={{ 
                  padding: '10px 20px', background: 'black', color: 'white', 
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: 'fit-content'
                }}
              >
                Aceptar
              </button>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};

export default DriverDashboard;