import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/imags/sogrinha_logo_text.png";
import RoutesName from "../routes/Routes";
import { ChevronDown, Home, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const TopBar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeMenu = () => {
    setOpenMenu(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
      navigate(RoutesName.LOGIN);
    } catch (error) {
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };

  return (
    <div className="bg-myPrimary p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
      <Link to={RoutesName.HOME}>
        <img src={logo} alt="Logo" className="h-8" />
      </Link>

      <nav className="flex items-center space-x-6">
        {/* Link Home */}
        <Link to={RoutesName.HOME} className="text-white flex items-center gap-1 hover:text-white">
          <Home size={20} />
          <span>Início</span>
        </Link>

        {/* Menu Proprietários */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => toggleMenu("Proprietários")}
            className="text-white flex items-center gap-1 hover:text-white"
          >
            Proprietários <ChevronDown size={16} />
          </button>
          {openMenu === "Proprietários" && (
            <div className="absolute mt-2 w-32 bg-white shadow-lg rounded-lg z-10">
              <Link
                to={RoutesName.OWNERS}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white rounded-t-lg last:rounded-b-lg"
                onClick={closeMenu}
              >
                Buscar
              </Link>
              <Link
                to={RoutesName.OWNER}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white last:rounded-b-lg"
                onClick={closeMenu}
              >
                Criar
              </Link>
            </div>
          )}
        </div>

        {/* Menu Locatários */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => toggleMenu("Locatários")}
            className="text-white flex items-center gap-1 hover:text-white"
          >
            Locatários <ChevronDown size={16} />
          </button>
          {openMenu === "Locatários" && (
            <div className="absolute mt-2 w-32 bg-white shadow-lg rounded-lg z-10">
              <Link
                to={RoutesName.LESSEES}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white rounded-t-lg last:rounded-b-lg"
                onClick={closeMenu}
              >
                Buscar
              </Link>
              <Link
                to={RoutesName.LESSEE}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white last:rounded-b-lg"
                onClick={closeMenu}
              >
                Criar
              </Link>
            </div>
          )}
        </div>

        {/* Menu Imóveis */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => toggleMenu("Imóveis")}
            className="text-white flex items-center gap-1 hover:text-white"
          >
            Imóveis <ChevronDown size={16} />
          </button>
          {openMenu === "Imóveis" && (
            <div className="absolute mt-2 w-32 bg-white shadow-lg rounded-lg z-10">
              <Link
                to={RoutesName.REAL_ESTATES}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white rounded-t-lg last:rounded-b-lg"
                onClick={closeMenu}
              >
                Buscar
              </Link>
              <Link
                to={RoutesName.REAL_ESTATE}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white last:rounded-b-lg"
                onClick={closeMenu}
              >
                Criar
              </Link>
            </div>
          )}
        </div>

        {/* Menu Contratos */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => toggleMenu("Contratos")}
            className="text-white flex items-center gap-1 hover:text-white"
          >
            Contratos <ChevronDown size={16} />
          </button>
          {openMenu === "Contratos" && (
            <div className="absolute mt-2 w-32 bg-white shadow-lg rounded-lg z-10">
              <Link
                to={RoutesName.CONTRACTS}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white rounded-t-lg last:rounded-b-lg"
                onClick={closeMenu}
              >
                Buscar
              </Link>
              <Link
                to={RoutesName.CONTRACT}
                className="block px-4 py-2 text-gray-700 hover:bg-myPrimary hover:text-white last:rounded-b-lg"
                onClick={closeMenu}
              >
                Criar
              </Link>
            </div>
          )}
        </div>

        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="text-white flex items-center gap-1 hover:text-white hover:bg-pink-700 px-3 py-1 rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default TopBar;
