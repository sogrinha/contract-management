import { db } from "./firebase"; // Importando a instância do Firestore
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  DocumentReference,
  getDoc,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { RealEstate } from "../models/RealEstate";
import { Owner } from "../models/Owner";
import { Lessee } from "../models/Lessee";
import * as XLSX from 'xlsx';

const realEstateCollection = collection(db, "realEstates");

const normalizeSearchField = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Criar um novo imóvel
export const createRealEstate = async (realEstate: RealEstate) => {
  realEstate.municipalRegistrationSearch = normalizeSearchField(realEstate.municipalRegistration)
  return await addDoc(realEstateCollection, realEstate);
};

export async function getRealEstateById(
  id: string
): Promise<RealEstate | null> {
  try {
    const realEstateRef = doc(db, "realEstates", id);
    const realEstateSnap = await getDoc(realEstateRef);

    if (realEstateSnap.exists()) {
      return { id: realEstateSnap.id, ...realEstateSnap.data() } as RealEstate;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Atualizar um imóvel existente
export const updateRealEstate = async (
  id: string,
  data: Partial<RealEstate>
) => {
  const realEstateDoc = doc(db, "realEstates", id);
  return await updateDoc(realEstateDoc, data);
};

// Deletar um imóvel
export const deleteRealEstate = async (id: string) => {
  const realEstateDoc = doc(db, "realEstates", id);
  return await deleteDoc(realEstateDoc);
};

export const fetchRealEstates = async (
  filters: {
    ownerName?: string;
    lesseeName?: string;
    municipalRegistration?: string;
    realEstateKind?: string;
    statusRealEstate?: string;
  },
  pageSize: number,
  lastVisible: QueryDocumentSnapshot | null
) => {
  let realEstatesQuery = query(collection(db, "realEstates"), limit(pageSize));

  // 🔵 Você pode manter filtros simples que existem direto na coleção (municipalRegistration, kind, status)
  if (filters.municipalRegistration) {
    const normalizedRegistration = normalizeSearchField(filters.municipalRegistration);
    realEstatesQuery = query(
      realEstatesQuery,
      where("municipalRegistrationSearch", ">=", normalizedRegistration),
      where(
        "municipalRegistrationSearch",
        "<=",
        normalizedRegistration + "\uf8ff"
      )
    );
  }

  if (filters.realEstateKind) {
    realEstatesQuery = query(
      realEstatesQuery,
      where("realEstateKind", "==", filters.realEstateKind)
    );
  }

  if (filters.statusRealEstate) {
    realEstatesQuery = query(
      realEstatesQuery,
      where("statusRealEstate", "==", filters.statusRealEstate)
    );
  }

  if (lastVisible) {
    realEstatesQuery = query(realEstatesQuery, startAfter(lastVisible));
  }

  // 🔵 Buscar imóveis
  const querySnapshot = await getDocs(realEstatesQuery);

  const realEstates = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const data = doc.data() as RealEstate;
      let ownerData: Owner | null = null;
      let lesseeData: Lessee | null = null;

      if (data.owner) {
        const ownerSnap = await getDoc(data.owner);
        ownerData = ownerSnap.exists() ? (ownerSnap.data() as Owner) : null;
        data.ownerName = ownerData?.fullName
      }

      if (data.lessee) {
        const lesseeSnap = await getDoc(data.lessee);
        lesseeData = lesseeSnap.exists() ? (lesseeSnap.data() as Lessee) : null;
        data.lesseeName = lesseeData?.fullName
      }

      return {
        id: doc.id,
        ...data,
        ownerData,
        lesseeData,
      };
    })
  );

  // 🔵 Aplicar filtro manual de ownerName / lesseeName (porque Firestore não filtra DocumentReference)
  const filteredRealEstates = realEstates.filter((re) => {
    const matchesOwner = filters.ownerName
      ? re.ownerData?.fullName
        .toLowerCase()
        .includes(filters.ownerName!.toLowerCase())
      : true;

    const matchesLessee = filters.lesseeName
      ? re.lesseeData?.fullName
        .toLowerCase()
        .includes(filters.lesseeName!.toLowerCase())
      : true;

    return matchesOwner && matchesLessee;
  });

  return {
    data: filteredRealEstates,
    lastVisible:
      querySnapshot.docs.length > 0
        ? querySnapshot.docs[querySnapshot.docs.length - 1]
        : null,
  };
};

export async function exportRealEstatesToExcel(
  collectionName: string = 'realEstates'
): Promise<void> {
  try {
    const realEstatesCollection = collection(db, collectionName);
    const querySnapshot = await getDocs(realEstatesCollection);

    const realEstates: RealEstate[] = [];
    querySnapshot.forEach((doc) => {
      realEstates.push({ id: doc.id, ...doc.data() } as RealEstate);
    });

    // Converter os dados para um formato adequado para o Excel
    const data = await Promise.all(realEstates.map(async (realEstate) => {
      const {
        municipalRegistrationSearch,
        owner,
        lessee,
        ownerData,
        lesseeData,
        ...realEstateData
      } = realEstate;

      // Buscar dados do proprietário
      let ownerInfo = { fullName: '', cpf: '' };
      if (owner) {
        const ownerDoc = await getDoc(owner);
        if (ownerDoc.exists()) {
          const ownerData = ownerDoc.data();
          ownerInfo = {
            fullName: ownerData.fullName || '',
            cpf: ownerData.cpf || ''
          };
        }
      }

      // Buscar dados do locatário
      let lesseeInfo = { fullName: '', cpf: '' };
      if (lessee) {
        const lesseeDoc = await getDoc(lessee);
        if (lesseeDoc.exists()) {
          const lesseeData = lesseeDoc.data();
          lesseeInfo = {
            fullName: lesseeData.fullName || '',
            cpf: lesseeData.cpf || ''
          };
        }
      }

      return {
        ID: realEstateData.id,
        'Registro Municipal': realEstateData.municipalRegistration,
        'Tipo de Imóvel': realEstateData.realEstateKind,
        'Status': realEstateData.statusRealEstate,
        'Estado': realEstateData.state,
        'Cidade': realEstateData.city,
        'Bairro': realEstateData.neighborhood,
        'Rua': realEstateData.street,
        'Número': realEstateData.number,
        'Complemento': realEstateData.complement || '',
        'CEP': realEstateData.cep,
        'Possui Vistoria': realEstateData.hasInspection ? 'Sim' : 'Não',
        'Possui Documentação': realEstateData.hasProofDocument ? 'Sim' : 'Não',
        'Observação': realEstateData.note || '',
        'Proprietário': ownerInfo.fullName,
        'CPF do Proprietário': ownerInfo.cpf,
        'Locatário': lesseeInfo.fullName,
        'CPF do Locatário': lesseeInfo.cpf
      };
    }));

    // Criar a planilha do Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Imóveis');

    // Gerar o arquivo Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
    const excelBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Criar um link para download do arquivo
    const url = window.URL.createObjectURL(excelBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'imoveis.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar imóveis para Excel:', error);
    throw error;
  }
}
