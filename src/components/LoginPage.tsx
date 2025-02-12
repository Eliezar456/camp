import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCampStore } from '../store/campStore';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [leaderName, setLeaderName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, adminLogin } = useAuthStore();
  const { leaders } = useCampStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Check if trying to login as admin
      if (password.trim()) {
        const success = await adminLogin(password);
        if (success) {
          navigate('/dashboard');
          return;
        }
        setError('Credenciales de administrador incorrectas');
      } 
      // Check if trying to login as leader
      else if (leaderName.trim()) {
        // Validate leader exists
        const leaderExists = leaders.some(leader => 
          leader.name.toLowerCase() === leaderName.toLowerCase()
        );
        
        if (!leaderExists) {
          setError('Líder no encontrado');
          setIsLoading(false);
          return;
        }
        
        const success = await login(leaderName);
        if (success) {
          navigate('/dashboard');
          return;
        }
        setError('Error al iniciar sesión. Por favor intente nuevamente.');
      } 
      // No credentials provided
      else {
        setError('Por favor ingresa un nombre de líder o la contraseña de administrador');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4QJrHTBxEEDukM-IexLwKP7ATsl6NGfYDEg&s" 
            alt="Tierra Alta Logo" 
            className="h-24 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Campamento</h1>
          <p className="text-gray-600 mt-2">Por favor ingresa tus credenciales</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              Tierra Alta Canalitos organizamos viajes al campamento de Tierra Alta
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Líder
            </label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingresa el nombre del líder"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña de Administrador
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Solo para administradores"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}