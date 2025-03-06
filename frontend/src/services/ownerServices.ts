import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  QueryDocumentSnapshot,
  setDoc,
  startAfter,
  where,
} from 'firebase/firestore';
import { Owner } from '../models/Owner';
import { db } from './firebase';
import * as XLSX from 'xlsx';

const OWNER_DB_NAME = 'owners';

const normalizeSearchField = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const createOwner = async (data: Omit<Owner, 'id'>): Promise<string> => {
  const normalizedData: Owner = {
    ...data,
    fullNameSearch: normalizeSearchField(data.fullName),
    rgSearch: normalizeSearchField(data.rg),
    cpfSearch: normalizeSearchField(data.cpf),
    celphoneSearch: normalizeSearchField(data.celphone),
    emailSearch: normalizeSearchField(data.email),
    cepSearch: normalizeSearchField(data.cep),
  };
  const docRef = await addDoc(collection(db, OWNER_DB_NAME), normalizedData);
  return docRef.id;
};

export const getOwnerById = async (id: string): Promise<Owner | null> => {
  const docRef = doc(db, OWNER_DB_NAME, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists()
    ? ({ id: docSnap.id, ...docSnap.data() } as Owner)
    : null;
};

export const updateOwner = async (
  id: string,
  data: Partial<Owner>
): Promise<void> => {
  const docRef = doc(db, OWNER_DB_NAME, id);
  const existingDoc = await getDoc(docRef);
  if (!existingDoc.exists()) {
    throw new Error('Owner not found');
  }

  const existingData = existingDoc.data() as Owner;
  const updatedData: Owner = {
    ...existingData,
    ...data,
    fullNameSearch:
      data.fullName !== undefined
        ? normalizeSearchField(data.fullName)
        : existingData.fullNameSearch,
    rgSearch:
      data.rg !== undefined
        ? normalizeSearchField(data.rg)
        : existingData.rgSearch,
    cpfSearch:
      data.cpf !== undefined
        ? normalizeSearchField(data.cpf)
        : existingData.cpfSearch,
    celphoneSearch:
      data.celphone !== undefined
        ? normalizeSearchField(data.celphone)
        : existingData.celphoneSearch,
    emailSearch:
      data.email !== undefined
        ? normalizeSearchField(data.email)
        : existingData.emailSearch,
  };

  await setDoc(docRef, updatedData);
};

export const deleteOwner = async (id: string): Promise<void> => {
  const docRef = doc(db, OWNER_DB_NAME, id);
  await deleteDoc(docRef);
};

export const fetchOwners = async (
  filters: {
    fullName?: string;
    cpf?: string;
    rg?: string;
    email?: string;
    cep?: string;
  },
  pageSize: number,
  lastVisible: QueryDocumentSnapshot | null
) => {
  let ownersQuery = query(collection(db, OWNER_DB_NAME), limit(pageSize));

  if (filters.fullName) {
    const normalizedFullName = normalizeSearchField(filters.fullName);
    if (normalizedFullName) {
      ownersQuery = query(
        ownersQuery,
        where('fullNameSearch', '>=', normalizedFullName),
        where('fullNameSearch', '<=', normalizedFullName + '\uf8ff')
      );
    }
  }

  if (filters.cpf) {
    const normalizedCpf = normalizeSearchField(filters.cpf);
    if (normalizedCpf) {
      ownersQuery = query(
        ownersQuery,
        where('cpfSearch', '>=', normalizedCpf),
        where('cpfSearch', '<=', normalizedCpf + '\uf8ff')
      );
    }
  }

  if (filters.rg) {
    const normalizedRg = normalizeSearchField(filters.rg);
    if (normalizedRg) {
      ownersQuery = query(
        ownersQuery,
        where('rgSearch', '>=', normalizedRg),
        where('rgSearch', '<=', normalizedRg + '\uf8ff')
      );
    }
  }

  if (filters.email) {
    const normalizedEmail = normalizeSearchField(filters.email);
    if (normalizedEmail) {
      ownersQuery = query(
        ownersQuery,
        where('emailSearch', '>=', normalizedEmail),
        where('emailSearch', '<=', normalizedEmail + '\uf8ff')
      );
    }
  }

  if (filters.cep) {
    const normalizedCep = normalizeSearchField(filters.cep);
    if (normalizedCep) {
      ownersQuery = query(
        ownersQuery,
        where('cepSearch', '>=', normalizedCep),
        where('cepSearch', '<=', normalizedCep + '\uf8ff')
      );
    }
  }

  // Pagination
  if (lastVisible) {
    ownersQuery = query(ownersQuery, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(ownersQuery);
  const data = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Owner
  );

  return {
    data,
    lastVisible:
      querySnapshot.docs.length > 0
        ? querySnapshot.docs[querySnapshot.docs.length - 1]
        : null,
  };
};

export async function exportOwnersToExcel(
  collectionName: string = 'owners'
): Promise<void> {
  try {
    const ownersCollection = collection(db, collectionName);
    const querySnapshot = await getDocs(ownersCollection);

    const owners: Owner[] = [];
    querySnapshot.forEach((doc) => {
      owners.push({ id: doc.id, ...doc.data() } as Owner);
    });

    // Converter os dados para um formato adequado para o Excel, excluindo os campos de busca
    const data = owners.map((owner) => {
      const {
        fullNameSearch,
        rgSearch,
        cpfSearch,
        celphoneSearch,
        emailSearch,
        cepSearch,
        ...ownerData
      } = owner;
      return {
        ID: ownerData.id,
        'Nome Completo': ownerData.fullName,
        'Estado Civil': ownerData.maritalStatus,
        Profissão: ownerData.profession,
        RG: ownerData.rg,
        'Orgão Emissor': ownerData.issuingBody,
        CPF: ownerData.cpf,
        Celular: ownerData.celphone,
        Email: ownerData.email,
        Estado: ownerData.state,
        Cidade: ownerData.city,
        Bairro: ownerData.neighborhood,
        Rua: ownerData.street,
        Número: ownerData.number,
        Complemento: ownerData.complement,
        CEP: ownerData.cep,
        Nota: ownerData.note,
        'Nome Completo Parceiro': ownerData.fullNamePartner,
        'RG Parceiro': ownerData.rgPartner,
        'Orgão Emissor Parceiro': ownerData.issuingBodyPartner,
        'CPF Parceiro': ownerData.cpfPartner,
        'Celular Parceiro': ownerData.celphonePartner,
        'Email Parceiro': ownerData.emailPartner,
        'Estado Parceiro': ownerData.statePartner,
        'Cidade Parceiro': ownerData.cityPartner,
        'Bairro Parceiro': ownerData.neighborhoodPartner,
        'Rua Parceiro': ownerData.streetPartner,
        'Número Parceiro': ownerData.numberPartner,
        'Complemento Parceiro': ownerData.complementPartner,
        'CEP Parceiro': ownerData.cepPartner,
      };
    });

    // Criar a planilha do Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Owners');

    // Gerar o arquivo Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const excelBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Criar um link para download do arquivo
    const url = window.URL.createObjectURL(excelBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'owners.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar Owners para Excel:', error);
  }
}
