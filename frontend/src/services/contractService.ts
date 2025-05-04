import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  DocumentReference,
  getDoc,
  QueryDocumentSnapshot,
  Query,
} from "firebase/firestore";
import { Contract, EContractKind, EStatus } from "../models/Contract";
import { RealEstate } from "../models/RealEstate";

const contractCollection = collection(db, "contracts");

// Criar contrato
export const createContract = async (contract: Contract) => {
  contract.identifier = generateIdentifier(contract.contractKind);

  if (!contract.ownerName && contract.owner) {
    const ownerSnap = await getDoc(contract.owner);
    if (ownerSnap.exists()) {
      contract.ownerName = ownerSnap.data().fullName;
    }
  }

  if (!contract.lesseeName && contract.lessee) {
    const lesseeSnap = await getDoc(contract.lessee);
    if (lesseeSnap.exists()) {
      contract.lesseeName = lesseeSnap.data().fullName;
    }
  }

  if (!contract.realEstateAddress && contract.realEstate) {
    const realEstateSnap = await getDoc(contract.realEstate);
    if (realEstateSnap.exists()) {
      const realEstateData = realEstateSnap.data() as RealEstate;
      contract.realEstateAddress = `${realEstateData.street}, ${realEstateData.number} - ${realEstateData.neighborhood}, ${realEstateData.city}/${realEstateData.state}`;
    }
  }

  const cleanedContract = Object.fromEntries(
    Object.entries(contract).filter(([_, v]) => v !== undefined)
  );
  return await addDoc(contractCollection, cleanedContract);
};

// Atualizar contrato
export const updateContract = async (
  id: string,
  updatedData: Partial<Contract>
) => {
  const cleanedData = Object.fromEntries(
    Object.entries(updatedData).filter(([_, v]) => v !== undefined)
  );
  const contractDoc = doc(db, "contracts", id);
  return await updateDoc(contractDoc, cleanedData);
};

// Deletar contrato
export const deleteContract = async (id: string) => {
  const contractDoc = doc(db, "contracts", id);
  return await deleteDoc(contractDoc);
};

// Obter contrato por ID
export const getContractById = async (id: string): Promise<Contract | null> => {
  const docRef = doc(db, "contracts", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  const contract = {
    id: snapshot.id,
    ...data,
    startDate: data.startDate.toDate?.() || data.startDate,
    endDate: data.endDate.toDate?.() || data.endDate,
  } as Contract;

  if (contract.realEstate) {
    const realEstateSnap = await getDoc(contract.realEstate);
    if (realEstateSnap.exists()) {
      contract.realEstateData = realEstateSnap.data() as RealEstate;
      contract.realEstateAddress = `${contract.realEstateData.street}, ${contract.realEstateData.number} - ${contract.realEstateData.neighborhood}, ${contract.realEstateData.city}/${contract.realEstateData.state}`;
    }
  }

  return contract;
};

// Listagem com filtro e paginação
export const fetchContracts = async (
  filters: Record<string, string> = {}, // Filtros padrões
  pageSize: number = 25, // Quantidade por página
  lastVisible: QueryDocumentSnapshot | null = null // Paginação
): Promise<{ data: Contract[]; lastVisible: QueryDocumentSnapshot | null }> => {
  let q: Query = query(contractCollection);

  // Aplica filtros
  Object.entries(filters).forEach(([field, value]) => {
    if (field === "endDate") {
      const date = new Date(value);
      q = query(q, where(field, ">=", date));
    } else {
      q = query(q, where(field, "==", value));
    }
  });

  // Ordenação e paginação
  q = query(q, orderBy("startDate", "desc"), limit(pageSize));
  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const snapshot = await getDocs(q);
  const contracts = await Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const contract = {
      id: doc.id,
      ...data,
      startDate: data.startDate.toDate?.() || data.startDate,
      endDate: data.endDate.toDate?.() || data.endDate,
    } as Contract;

    if (contract.realEstate) {
      const realEstateSnap = await getDoc(contract.realEstate);
      if (realEstateSnap.exists()) {
        contract.realEstateData = realEstateSnap.data() as RealEstate;
        contract.realEstateAddress = `${contract.realEstateData.street}, ${contract.realEstateData.number} - ${contract.realEstateData.neighborhood}, ${contract.realEstateData.city}/${contract.realEstateData.state}`;
      }
    }

    return contract;
  }));

  return {
    data: contracts,
    lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
  };
};

// Geração de identificador amigável
function generateIdentifier(contractKind: string): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  const formatedDate = `${day}${month}${year}`;
  const randomNumber = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const kind = getContractKindAbbreviation(contractKind);

  return `#${kind}${formatedDate}${randomNumber}`;
}

function getContractKindAbbreviation(contractKind: string): string {
  switch (contractKind) {
    case EContractKind.Sale_With_Exclusivity:
      return "VDE";
    case EContractKind.Sale_without_Exclusivity:
      return "VDS";
    case EContractKind.Rental_With_Administration:
      return "ALA";
    case EContractKind.Rental:
      return "ALG";
    default:
      return "UNK";
  }
}
