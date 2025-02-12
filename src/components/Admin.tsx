import React, { useState } from 'react';
import Layout from './Layout';
import { Save, Download, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useCampStore } from '../store/campStore';
import ConfirmDialog from './ConfirmDialog';

interface EditingLeader {
  name: string;
  assignedSpots: number;
  isNew?: boolean;
}

export default function Admin() {
  const { leaders, totalSpots, setTotalSpots, setLeaders, addLeader, updateLeader, deleteLeader } = useCampStore();
  const [editingLeaders, setEditingLeaders] = useState<Record<string, EditingLeader>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (leader: EditingLeader) => {
    setEditingLeaders({
      ...editingLeaders,
      [leader.name]: { ...leader }
    });
  };

  const handleSaveEdit = (originalName: string, editedLeader: EditingLeader) => {
    updateLeader(originalName, editedLeader);
    const newEditingLeaders = { ...editingLeaders };
    delete newEditingLeaders[originalName];
    setEditingLeaders(newEditingLeaders);
  };

  const handleCancelEdit = (leaderName: string) => {
    const newEditingLeaders = { ...editingLeaders };
    delete newEditingLeaders[leaderName];
    setEditingLeaders(newEditingLeaders);
  };

  const handleDelete = (leaderName: string) => {
    setDeleteConfirm(leaderName);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteLeader(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleAddNew = () => {
    const newLeader: EditingLeader = {
      name: '',
      assignedSpots: 0,
      isNew: true
    };
    setEditingLeaders({
      ...editingLeaders,
      'new': newLeader
    });
  };

  const handleSaveNew = (leader: EditingLeader) => {
    if (leader.name.trim() === '') {
      alert('El nombre del líder no puede estar vacío');
      return;
    }
    if (leaders.some(l => l.name === leader.name)) {
      alert('Ya existe un líder con ese nombre');
      return;
    }
    addLeader(leader);
    const newEditingLeaders = { ...editingLeaders };
    delete newEditingLeaders['new'];
    setEditingLeaders(newEditingLeaders);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
          <div className="flex gap-4">
            <button 
              onClick={handleAddNew}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              disabled={editingLeaders['new'] !== undefined}
            >
              <Plus className="w-5 h-5" />
              Agregar Líder
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Datos
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Gestión de Cupos</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cupos Totales del Campamento
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={totalSpots}
                    onChange={(e) => setTotalSpots(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-4">Gestión de Líderes y Cupos</h3>
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
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editingLeaders['new'] && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editingLeaders['new'].name}
                            onChange={(e) => setEditingLeaders({
                              ...editingLeaders,
                              'new': { ...editingLeaders['new'], name: e.target.value }
                            })}
                            placeholder="Nombre del líder"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editingLeaders['new'].assignedSpots}
                            onChange={(e) => setEditingLeaders({
                              ...editingLeaders,
                              'new': { ...editingLeaders['new'], assignedSpots: Number(e.target.value) }
                            })}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">0</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleSaveNew(editingLeaders['new'])}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleCancelEdit('new')}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {leaders.map((leader) => (
                      <tr key={leader.name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLeaders[leader.name] ? (
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={editingLeaders[leader.name].name}
                              onChange={(e) => setEditingLeaders({
                                ...editingLeaders,
                                [leader.name]: { ...editingLeaders[leader.name], name: e.target.value }
                              })}
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{leader.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLeaders[leader.name] ? (
                            <input
                              type="number"
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={editingLeaders[leader.name].assignedSpots}
                              onChange={(e) => setEditingLeaders({
                                ...editingLeaders,
                                [leader.name]: { ...editingLeaders[leader.name], assignedSpots: Number(e.target.value) }
                              })}
                            />
                          ) : (
                            <span className="text-sm text-gray-500">{leader.assignedSpots}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{leader.usedSpots}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {editingLeaders[leader.name] ? (
                              <>
                                <button 
                                  onClick={() => handleSaveEdit(leader.name, editingLeaders[leader.name])}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleCancelEdit(leader.name)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleEdit(leader)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(leader.name)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar al líder ${deleteConfirm}? Esta acción no se puede deshacer.`}
      />
    </Layout>
  );
}