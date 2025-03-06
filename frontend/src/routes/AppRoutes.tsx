import { JSX } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import CreateOwner from "../pages/owner/CreateOwner";
import OwnerList from "../pages/owner/OwnerList";
import RoutesName from "./Routes";
import CreateLessee from "../pages/lessee/CreateLessee";
import LesseeList from "../pages/lessee/LesseeList";
import CreateRealEstate from "../pages/real_estate/CreateRealEstate";
import RealEstateList from "../pages/real_estate/RealEstateList";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to={RoutesName.LOGIN} replace />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Página de Login (pública) */}
        <Route path={RoutesName.LOGIN} element={<Login />} />

        {/* Rotas privadas (somente usuários autenticados podem acessar) */}

        {/* Criar Proprietário */}
        <Route
          path={`${RoutesName.OWNER}/:id?`}
          element={
            <PrivateRoute>
              <>
                <TopBar />
                <CreateOwner />
              </>
            </PrivateRoute>
          }
        />
        {/* Listar Proprietário */}
        <Route
          path={RoutesName.OWNERS}
          element={
            <PrivateRoute>
              <>
                <TopBar />
                <OwnerList />
              </>
            </PrivateRoute>
          }
        />

        {/* Criar Locatário */}
        <Route
          path={`${RoutesName.LESSEE}/:id?`}
          element={
            <PrivateRoute>
              <>
                <TopBar />
                <CreateLessee />
              </>
            </PrivateRoute>
          }
        />
        {/* Listar locatario */}
        <Route
          path={RoutesName.LESSEES}
          element={
            <PrivateRoute>
              <>
                <TopBar />
                <LesseeList />
              </>
            </PrivateRoute>
          }
        />

        {/* Criar Imóvel */}
        <Route
          path={`${RoutesName.REAL_ESTATE}/:id?`}
          element={
            <PrivateRoute>
              <>
                <TopBar />
                <CreateRealEstate />
              </>
            </PrivateRoute>
          }
        />
        {/* Listar locatario */}
        <Route
          path={RoutesName.REAL_ESTATES}
          element={
            <PrivateRoute>
              <>
                <TopBar />
                <RealEstateList />
              </>
            </PrivateRoute>
          }
        />

        {/* Redireciona para login se a rota não existir */}
        <Route path="*" element={<Navigate to={RoutesName.LOGIN} />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
