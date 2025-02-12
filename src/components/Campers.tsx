import React, { useState } from 'react';
import Layout from './Layout';
import { Search, Plus, Edit2, Trash2, Download } from 'lucide-react';
import { useCampStore } from '../store/campStore';
import { useAuthStore } from '../store/authStore';
import { useTrackingStore } from '../store/trackingStore';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { Camper } from '../types';
import * as XLSX from 'xlsx';

interface CamperFormData {
  fullName: string;
  institution: string;
  leader: string;
  birthDate: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  address: string;
  department: string;
  guardianName?: string;
  guardianPhone?: string;
}

interface BulkDeleteConfirm {
  type: 'all' | 'leader' | 'institution';
  value?: string;
}

export default function Campers() {
  const { isAdmin } = useAuthStore();
  const { campers, leaders, addCamper, updateCamper, deleteCamper, bulkDeleteCampers } = useCampStore();
  const { deleteEntriesForCamper, deleteAllEntries, deleteEntriesByLeader, deleteEntriesByInstitution } = useTrackingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<BulkDeleteConfirm | null>(null);
  const [editingCamper, setEditingCamper] = useState<Camper | null>(null);
  const [formData, setFormData] = useState<CamperFormData>({
    fullName: '',
    institution: '',
    leader: leaders[0]?.name || '',
    birthDate: '',
    age: 0,
    gender: 'M',
    phone: '',
    address: '',
    department: '',
  });

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateForDB = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.age < 0 || formData.age > 120) {
      alert('Por favor ingrese una edad válida');
      return;
    }

    if (formData.age < 18 && (!formData.guardianName || !formData.guardianPhone)) {
      alert('La información del tutor es obligatoria para menores de edad');
      return;
    }

    // Format the date for database storage
    const formattedData = {
      ...formData,
      birthDate: formatDateForDB(formData.birthDate)
    };

    try {
      if (isAddModalOpen) {
        await addCamper(formattedData);
        setIsAddModalOpen(false);
      } else if (isEditModalOpen && editingCamper) {
        await updateCamper(editingCamper.id, formattedData);
        setIsEditModalOpen(false);
        setEditingCamper(null);
      }
    } catch (error) {
      console.error('Error saving camper:', error);
      alert('Hubo un error al guardar los datos. Por favor intente nuevamente.');
    }
  };

  const handleEdit = (camper: Camper) => {
    setEditingCamper(camper);
    setFormData({
      ...camper,
      birthDate: formatDateForDisplay(camper.birthDate || '')
    });
    setIsEditModalOpen(true);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Institución/Iglesia
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Líder
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.leader}
          onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
        >
          {leaders.map((leader) => (
            <option key={leader.name} value={leader.name}>
              {leader.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fecha de Nacimiento (DD-MM-YYYY)
        </label>
        <input
          type="text"
          placeholder="DD-MM-YYYY"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.birthDate}
          onChange={(e) => {
            const value = e.target.value;
            setFormData(prev => ({ ...prev, birthDate: value }));
            
            // Calculate age if a valid date is entered
            if (value.length === 10) { // DD-MM-YYYY format
              const [day, month, year] = value.split('-').map(Number);
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const birthDate = new Date(year, month - 1, day);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                setFormData(prev => ({ ...prev, age }));
              }
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Edad
        </label>
        <input
          type="number"
          required
          readOnly
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          value={formData.age}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Género
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
        >
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="tel"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Departamento
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />
      </div>

      {(formData.age < 18 || formData.guardianName || formData.guardianPhone) && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Tutor
              {formData.age < 18 && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              required={formData.age < 18}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono del Tutor
              {formData.age < 18 && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              required={formData.age < 18}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.guardianPhone}
              onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isAddModalOpen ? 'Agregar' : 'Guardar'}
        </button>
      </div>
    </form>
  );

  const exportToExcel = () => {
    const data = campers.map(camper => ({
      'Número': camper.sequentialNumber,
      'Nombre Completo': camper.fullName,
      'Institución': camper.institution,
      'Líder': camper.leader,
      'Edad': camper.age,
      'Género': camper.gender,
      'Teléfono': camper.phone,
      'Dirección': camper.address,
      'Departamento': camper.department,
      'Tutor': camper.guardianName,
      'Teléfono Tutor': camper.guardianPhone
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Campistas');
    XLSX.writeFile(wb, 'campistas.xlsx');
  };

  const handleBulkDelete = (type: 'all' | 'leader' | 'institution', value?: string) => {
    setBulkDeleteConfirm({ type, value });
  };

  const confirmBulkDelete = () => {
    if (!bulkDeleteConfirm) return;
    
    switch (bulkDeleteConfirm.type) {
      case 'all':
        bulkDeleteCampers();
        deleteAllEntries();
        break;
      case 'leader':
        if (!bulkDeleteConfirm.value) {
          alert('Por favor seleccione un líder');
          return;
        }
        bulkDeleteCampers('leader', bulkDeleteConfirm.value);
        deleteEntriesByLeader(bulkDeleteConfirm.value);
        break;
      case 'institution':
        if (!bulkDeleteConfirm.value) {
          alert('Por favor seleccione una institución');
          return;
        }
        bulkDeleteCampers('institution', bulkDeleteConfirm.value);
        deleteEntriesByInstitution(bulkDeleteConfirm.value);
        break;
    }
    
    setBulkDeleteConfirm(null);
  };

  const filteredCampers = campers.filter(camper => 
    camper.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camper.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camper.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camper.sequentialNumber.toString().includes(searchTerm)
  );

  const handleAdd = () => {
    setFormData({
      fullName: '',
      institution: '',
      leader: leaders[0]?.name || '',
      birthDate: '',
      age: 0,
      gender: 'M',
      phone: '',
      address: '',
      department: '',
      guardianName: '',
      guardianPhone: '',
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm !== null) {
      deleteCamper(deleteConfirm);
      deleteEntriesForCamper(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Campistas</h1>
          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Campista
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar a Excel
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm({ type: 'all' })}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, líder, institución o número..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Institución/Iglesia
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Líder
                    </th>
                    {isAdmin && (
                      <>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Edad
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Género
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampers.map((camper) => (
                    <tr key={camper.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {camper.sequentialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {camper.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {camper.institution}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {camper.leader}
                      </td>
                      {isAdmin && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {camper.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {camper.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {camper.phone}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(camper)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(camper.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Campista"
      >
        {renderForm()}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCamper(null);
        }}
        title="Editar Campista"
      >
        {renderForm()}
      </Modal>

      <Modal
        isOpen={bulkDeleteConfirm !== null}
        onClose={() => setBulkDeleteConfirm(null)}
        title="Eliminar Campistas"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setBulkDeleteConfirm({ type: 'all' })}
              className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${
                bulkDeleteConfirm?.type === 'all' ? 'bg-gray-100' : ''
              }`}
            >
              Eliminar todos los campistas
            </button>
            <button
              onClick={() => setBulkDeleteConfirm({ type: 'leader' })}
              className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${
                bulkDeleteConfirm?.type === 'leader' ? 'bg-gray-100' : ''
              }`}
            >
              Eliminar por líder
            </button>
            <button
              onClick={() => setBulkDeleteConfirm({ type: 'institution' })}
              className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${
                bulkDeleteConfirm?.type === 'institution' ? 'bg-gray-100' : ''
              }`}
            >
              Eliminar por institución
            </button>
          </div>

          {(bulkDeleteConfirm?.type === 'leader' || bulkDeleteConfirm?.type === 'institution') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccione {bulkDeleteConfirm.type === 'leader' ? 'un líder' : 'una institución'}
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={bulkDeleteConfirm.value || ''}
                onChange={(e) => setBulkDeleteConfirm({ ...bulkDeleteConfirm, value: e.target.value })}
              >
                <option value="">Seleccione {bulkDeleteConfirm.type === 'leader' ? 'un líder' : 'una institución'}</option>
                {bulkDeleteConfirm.type === 'leader'
                  ? leaders.map(leader => (
                      <option key={leader.name} value={leader.name}>{leader.name}</option>
                    ))
                  : [...new Set(campers.map(c => c.institution))].map(institution => (
                      <option key={institution} value={institution}>{institution}</option>
                    ))
                }
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setBulkDeleteConfirm(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              onClick={confirmBulkDelete}
              disabled={
                (bulkDeleteConfirm?.type === 'leader' || bulkDeleteConfirm?.type === 'institution') &&
                !bulkDeleteConfirm.value
              }
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este campista? Esta acción no se puede deshacer."
      />
    </Layout>
  );
}