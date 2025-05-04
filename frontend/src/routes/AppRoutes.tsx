import { JSX } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Home from "../pages/Home";
import CreateOwner from "../pages/owner/CreateOwner";
import OwnerList from "../pages/owner/OwnerList";
import RoutesName from "./Routes";
import CreateLessee from "../pages/lessee/CreateLessee";
import LesseeList from "../pages/lessee/LesseeList";
import CreateRealEstate from "../pages/real_estate/CreateRealEstate";
import RealEstateList from "../pages/real_estate/RealEstateList";
import CreateContract from "../pages/contract/CreateContract";
import ContractList from "../pages/contract/ContractList";

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

        {/* Página Inicial */}
        <Route
          path={RoutesName.HOME}
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Criar Proprietário */}
        <Route
          path={`${RoutesName.OWNER}/:id?`}
          element={
            <PrivateRoute>
              <Layout>
                <CreateOwner />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Listar Proprietário */}
        <Route
          path={RoutesName.OWNERS}
          element={
            <PrivateRoute>
              <Layout>
                <OwnerList />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Criar Locatário */}
        <Route
          path={`${RoutesName.LESSEE}/:id?`}
          element={
            <PrivateRoute>
              <Layout>
                <CreateLessee />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Listar locatario */}
        <Route
          path={RoutesName.LESSEES}
          element={
            <PrivateRoute>
              <Layout>
                <LesseeList />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Criar Imóvel */}
        <Route
          path={`${RoutesName.REAL_ESTATE}/:id?`}
          element={
            <PrivateRoute>
              <Layout>
                <CreateRealEstate />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Listar Imóveis */}
        <Route
          path={RoutesName.REAL_ESTATES}
          element={
            <PrivateRoute>
              <Layout>
                <RealEstateList />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Criar Contrato */}
        <Route
          path={`${RoutesName.CONTRACT}/:id?`}
          element={
            <PrivateRoute>
              <Layout>
                <CreateContract />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Listar Contratos */}
        <Route
          path={RoutesName.CONTRACTS}
          element={
            <PrivateRoute>
              <Layout>
                <ContractList />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Redireciona para o dashboard se a rota não existir */}
        <Route path="*" element={<Navigate to={RoutesName.HOME} />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
