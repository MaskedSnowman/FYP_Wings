import React, { useEffect, useState } from 'react';
import {Duffel} from '@duffel/api'
import {Client} from '@duffel/api/Client'

const ExamplePage: React.FC = () => {
  const [airlines, setAirlines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirlines = async () => {
      const duffel = new Duffel({
        token: 'duffel_test_bl6lsCRkoKbnG3GGptTbNRkW92M2QTZDWsU_oGp_QqL', // Replace with your actual Duffel API key
      });

      try {
        const response = await duffel.airlines.list();
        setAirlines(response.data);
      } catch (error) {
        setError(`Error fetching airlines: ${error.message}`);
      }
    };

    fetchAirlines();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Airlines List</h1>
      <ul>
        {airlines.map((airline) => (
          <li key={airline.id}>
            {airline.name} - {airline.iata_code}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExamplePage;
