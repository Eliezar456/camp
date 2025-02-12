import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Home, 
  Users, 
  Bell, 
  MessageSquare,
  Settings,
  LogOut,
  ClipboardCheck,
  FileText,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <NavLink to="/dashboard" active={isActive('/dashboard')} onClick={() => setIsMenuOpen(false)}>
        <Home className="w-5 h-5" />
        <span>Inicio</span>
      </NavLink>
      
      <NavLink to="/campers" active={isActive('/campers')} onClick={() => setIsMenuOpen(false)}>
        <Users className="w-5 h-5" />
        <span>Campistas</span>
      </NavLink>
      
      <NavLink to="/announcements" active={isActive('/announcements')} onClick={() => setIsMenuOpen(false)}>
        <Bell className="w-5 h-5" />
        <span>Anuncios</span>
      </NavLink>
      
      <NavLink to="/chat" active={isActive('/chat')} onClick={() => setIsMenuOpen(false)}>
        <MessageSquare className="w-5 h-5" />
        <span>Chat</span>
      </NavLink>

      <NavLink to="/tracking" active={isActive('/tracking')} onClick={() => setIsMenuOpen(false)}>
        <ClipboardCheck className="w-5 h-5" />
        <span>Seguimiento</span>
      </NavLink>

      <NavLink to="/documents" active={isActive('/documents')} onClick={() => setIsMenuOpen(false)}>
        <FileText className="w-5 h-5" />
        <span>Documentos</span>
      </NavLink>

      {isAdmin && (
        <NavLink to="/admin" active={isActive('/admin')} onClick={() => setIsMenuOpen(false)}>
          <Settings className="w-5 h-5" />
          <span>Admin</span>
        </NavLink>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center px-2 py-2">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4QJrHTBxEEDukM-IexLwKP7ATsl6NGfYDEg&s" 
                  alt="Tierra Alta Logo" 
                  className="h-8 w-auto"
                />
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <NavLinks />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>

            <div className="hidden md:flex md:items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLinks />
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ children, to, active, onClick }: { 
  children: React.ReactNode, 
  to: string, 
  active: boolean,
  onClick?: () => void 
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
        active
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}