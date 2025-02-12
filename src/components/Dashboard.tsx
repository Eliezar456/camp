import React from 'react';
import Layout from './Layout';
import { Users, CheckSquare } from 'lucide-react';
import { useCampStore } from '../store/campStore';

export default function Dashboard() {
  const { totalSpots, leaders, campers } = useCampStore();
  const usedSpots = campers.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4QJrHTBxEEDukM-IexLwKP7ATsl6NGfYDEg&s" 
            alt="Tierra Alta Logo" 
            className="h-16 w-auto"
          />
          <h1 className="text-2xl font-semibold text-gray-900">Inicio</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Misión</h2>
          <p className="text-gray-700 leading-relaxed">
            Llevar a todos los jóvenes posibles a vivir la experiencia en Tierra Alta y hacer un cambio en la juventud de Canalitos.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gratitud</h2>
          <p className="text-gray-700 leading-relaxed">
            Agradecemos eternamente a Tierra Alta y a Rawlings Inc. que sin ellos nada sería posible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Cupos Totales</h2>
                <p className="text-3xl font-bold text-gray-900">{totalSpots}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Cupos Ocupados</h2>
                <p className="text-3xl font-bold text-gray-900">{usedSpots}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Cupos Disponibles</h2>
                <p className="text-3xl font-bold text-gray-900">{totalSpots - usedSpots}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Cupos por Líder</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Líder
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cupos Asignados
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cupos Utilizados
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cupos Disponibles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaders.map((leader) => (
                    <tr key={leader.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {leader.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {leader.assignedSpots}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {leader.usedSpots}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {leader.assignedSpots - leader.usedSpots}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}