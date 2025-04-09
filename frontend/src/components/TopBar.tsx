import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/imags/sogrinha_logo_text.png";
import RoutesName from "../routes/Routes";
import { ChevronDown } from "lucide-react";

const TopBar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  const navigate = useNavigate();

  const closeMenu = () => {
    setOpenMenu(null);
  };

  return (
    <div className="bg-myPrimary p-4 flex items-center justify-between shadow-md">
      <Link to={RoutesName.LOGIN}>
        <img src={logo} alt="Logo" className="h-8" />
      </Link>
      <nav className="flex space-x-8 mr-10">
        <button
          onClick={() =>
            navigate(`${RoutesName.REAL_ESTATE}/bX7lZZ0kmio4eHZVkSvZ`)
          }
          className="bg-blue-500 text-white p-2 rounded"
        >
          Imovel Teste
        </button>
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
      </nav>
    </div>
  );
};

export default TopBar;
