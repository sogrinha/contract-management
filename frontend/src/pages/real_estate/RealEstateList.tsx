import { useEffect, useState } from "react";
import { getRealEstates } from "../../services/realEstateService";
import { RealEstate } from "../../models/RealEstate";

import { getDoc } from "firebase/firestore";

export default function RealEstateList() {
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRealEstates = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getRealEstates({}, reset ? null : lastDoc);
      const enrichedData = await Promise.all(
        response.data.map(async (realEstate) => {
          const ownerSnap = await getDoc(realEstate.owner);
          const lesseeSnap = realEstate.lessee
            ? await getDoc(realEstate.lessee)
            : null;
          return {
            ...realEstate,
            ownerName: ownerSnap.exists()
              ? ownerSnap.data().fullName
              : "Desconhecido",
            lesseeName: lesseeSnap?.exists()
              ? lesseeSnap.data().fullName
              : "Sem Locatário",
          };
        })
      );

      setRealEstates(reset ? enrichedData : [...realEstates, ...enrichedData]);
      setLastDoc(response.lastDoc);
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealEstates(true);
  }, [searchTerm]);

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="max-w-full mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Lista de Imóveis</h1>
        <div className="mb-4 grid grid-cols-12 gap-2 items-center">
          <input
            type="text"
            placeholder="Buscar por proprietário"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded shadow col-span-6"
          />
          <div className="col-span-6 flex justify-end">
            <button
              onClick={() => fetchRealEstates(true)}
              className="bg-green-500 text-white"
            >
              Buscar
            </button>
          </div>
        </div>
        <div className="border rounded p-4 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Nome do Proprietário</th>
                <th className="border p-2">Nome do Locatário</th>
                <th className="border p-2">Número de Registro</th>
                <th className="border p-2">Endereço</th>
                <th className="border p-2">Tipo</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {realEstates.length > 0 ? (
                realEstates.map((realEstate) => (
                  <tr key={realEstate.id} className="border">
                    <td className="border p-2">{realEstate.ownerName}</td>
                    <td className="border p-2">{realEstate.lesseeName}</td>
                    <td className="border p-2">
                      {realEstate.municipalRegistration}
                    </td>
                    <td className="border p-2">
                      {realEstate.street}, {realEstate.number} -{" "}
                      {realEstate.city}
                    </td>
                    <td className="border p-2">{realEstate.realEstateKind}</td>
                    <td className="border p-2">
                      {realEstate.statusRealEstate}
                    </td>
                    <td className="border p-2 flex gap-2">
                      <button className="bg-blue-500 text-white">Editar</button>
                      <button className="bg-red-500 text-white">Excluir</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Nenhum imóvel encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {lastDoc && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => fetchRealEstates()}
              disabled={loading}
              className="bg-green-500 text-white"
            >
              {loading ? "Carregando..." : "Carregar Mais"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
