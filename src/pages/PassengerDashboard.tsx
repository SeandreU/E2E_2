import React, { useEffect, useState } from 'react';
import type { User, Trip } from '../types/index';
import { useNavigate } from 'react-router-dom';

const PassengerDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        const [userRes, tripsRes] = await Promise.all([
          fetch('http://localhost:8080/users/me', { headers }),
          fetch('http://localhost:8080/trips', { headers })
        ]);

        if (userRes.ok && tripsRes.ok) {
          const userData = await userRes.json();
          const tripsData = await tripsRes.json();
          setUser(userData);
          setTrips(tripsData);
        } else if (userRes.status === 401) {
          navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching passenger data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return (
        <span style={{ background: '#3c9ffb', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>
            PENDING
            </span>);
      case 'IN_PROGFRESS': return (
        <span style={{ background: '#e0f74a', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>
            IN PROGRESS
            </span>);
      case 'COMPLETED': return( 
        <span style={{ background: '#10b948', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>
            COMPLETED
            </span>);
      default: return (
        null);
    }
  };

  if (loading) return (<p>
    Cargando dashboard...
    </p>);
  if (!user) return (<p>
    Error al cargar el usuario.
    </p>);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Hola, {user.firstName} {user.lastName}</h2>
        <button 
          onClick={() => navigate('/request-trip')}
          style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Pedir nuevo viaje
        </button>
      </header>

      <h3>Mis Viajes</h3>
      {trips.length === 0 ? (
        <p>Aún no has realizado ningún viaje.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {trips.map(trip => (
            <li key={trip.id} style={{ border: '1px solid #b5f9eb', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Viaje #{trip.id}</strong>
                {getStatusBadge(trip.status)}
              </div>
              <p><strong>Origen:</strong> {trip.pickupAddress}</p>
              <p><strong>Destino:</strong> {trip.dropoffAddress}</p>
              <button onClick={() => navigate(`/trips/${trip.id}`)}>Ver detalle</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PassengerDashboard;