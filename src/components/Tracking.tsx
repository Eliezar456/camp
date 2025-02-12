import React, { useState } from 'react';
import Layout from './Layout';
import { Plus, Trash2, Search } from 'lucide-react';
import { useTrackingStore, Decision } from '../store/trackingStore';
import { useCampStore } from '../store/campStore';
import { useAuthStore } from '../store/authStore';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

export default function Tracking() {
  const { isAdmin } = useAuthStore();
  const { entries, addEntry, deleteEntry } = useTrackingStore();
  const { campers } = useCampStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedCamper, setSelectedCamper] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<Decision>('accepted');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamper) return;

    const camperId = parseInt(selectedCamper);
    addEntry({
      camperId,
      decision: selectedDecision
    });

    setIsModalOpen(false);
    setSelectedCamper('');
    setSelectedDecision('accepted');
    setSearchTerm('');
  };

  const getCamperInfo = (camperId: number) => {
    const camper = campers.find(c => c.id === camperId);
    return {
      name: camper?.fullName || 'Campista no encontrado',
      leader: camper?.leader || 'Líder no encontrado'
    };
  };

  const filteredCampers = campers.filter(camper => 
    camper.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Seguimiento de Decisiones</h1>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Decisión
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campista
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Líder
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decisión
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => {
                const camperInfo = getCamperInfo(entry.camperId);
                return (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {camperInfo.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {camperInfo.leader}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.decision === 'accepted' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.decision === 'accepted' ? 'Aceptó' : 'Reconcilió'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => setDeleteConfirm(entry.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCamper('');
          setSelectedDecision('accepted');
          setSearchTerm('');
        }}
        title="Registrar Nueva Decisión"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar y Seleccionar Campista
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre del campista..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                {filteredCampers.length > 0 ? (
                  filteredCampers.map((camper) => (
                    <button
                      key={camper.id}
                      type="button"
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        selectedCamper === camper.id.toString() ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedCamper(camper.id.toString());
                        setSearchTerm(camper.fullName);
                      }}
                    >
                      <div>
                        <span className="font-medium">{camper.fullName}</span>
                        <span className="text-gray-500 text-sm ml-2">({camper.leader})</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No se encontraron campistas
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Decisión
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value as Decision)}
            >
              <option value="accepted">Aceptó</option>
              <option value="reconciled">Reconcilió</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedCamper('');
                setSelectedDecision('accepted');
                setSearchTerm('');
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={!selectedCamper}
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm !== null) {
            deleteEntry(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
      />
    </Layout>
  );
}