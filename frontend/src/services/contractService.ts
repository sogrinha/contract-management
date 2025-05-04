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
import * as XLSX from 'xlsx';

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

export async function exportContractsToExcel(
  collectionName: string = 'contracts'
): Promise<void> {
  try {
    const contractsCollection = collection(db, collectionName);
    const querySnapshot = await getDocs(contractsCollection);

    const contracts: Contract[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      contracts.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate?.() || data.startDate,
        endDate: data.endDate.toDate?.() || data.endDate,
      } as Contract);
    });

    // Converter os dados para um formato adequado para o Excel
    const data = await Promise.all(contracts.map(async (contract) => {
      const {
        owner,
        lessee,
        realEstate,
        ownerData,
        lesseeData,
        realEstateData,
        ...contractData
      } = contract;

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

      // Buscar dados do imóvel
      let realEstateInfo = { address: '', registration: '' };
      if (realEstate) {
        const realEstateDoc = await getDoc(realEstate);
        if (realEstateDoc.exists()) {
          const realEstateData = realEstateDoc.data() as RealEstate;
          realEstateInfo = {
            address: `${realEstateData.street}, ${realEstateData.number} - ${realEstateData.neighborhood}, ${realEstateData.city}/${realEstateData.state}`,
            registration: realEstateData.municipalRegistration
          };
        }
      }

      return {
        ID: contractData.id,
        'Identificador': contractData.identifier,
        'Tipo de Contrato': contractData.contractKind,
        'Status': contractData.status,
        'Data de Início': contractData.startDate.toLocaleDateString('pt-BR'),
        'Data de Término': contractData.endDate.toLocaleDateString('pt-BR'),
        'Dia do Pagamento': contractData.dayPayment,
        'Valor do Pagamento': contractData.paymentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        'Duração (meses)': contractData.duration,
        'Proprietário': ownerInfo.fullName,
        'CPF do Proprietário': ownerInfo.cpf,
        'Locatário': lesseeInfo.fullName,
        'CPF do Locatário': lesseeInfo.cpf,
        'Imóvel': realEstateInfo.address,
        'Registro do Imóvel': realEstateInfo.registration
      };
    }));

    // Criar a planilha do Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');

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
    link.setAttribute('download', 'contratos.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar contratos para Excel:', error);
    throw error;
  }
}
