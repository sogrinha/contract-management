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
} from "firebase/firestore";
import { Lessee } from "../models/Lessee";
import { db } from "./firebase";
import * as XLSX from "xlsx";

const LESSEE_DB_NAME = "lessees";

const normalizeSearchField = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const createLessee = async (
  data: Omit<Lessee, "id">
): Promise<string> => {
  const normalizedData: Lessee = {
    ...data,
    fullNameSearch: normalizeSearchField(data.fullName),
    rgSearch: normalizeSearchField(data.rg),
    cpfSearch: normalizeSearchField(data.cpf),
    celphoneSearch: normalizeSearchField(data.celphone),
    emailSearch: normalizeSearchField(data.email),
    cepSearch: normalizeSearchField(data.cep),
  };
  const docRef = await addDoc(collection(db, LESSEE_DB_NAME), normalizedData);
  return docRef.id;
};

export const getLesseeById = async (id: string): Promise<Lessee | null> => {
  const docRef = doc(db, LESSEE_DB_NAME, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists()
    ? ({ id: docSnap.id, ...docSnap.data() } as Lessee)
    : null;
};

export const updateLessee = async (
  id: string,
  data: Partial<Lessee>
): Promise<void> => {
  const docRef = doc(db, LESSEE_DB_NAME, id);
  const existingDoc = await getDoc(docRef);
  if (!existingDoc.exists()) {
    throw new Error("Lessee not found");
  }

  const existingData = existingDoc.data() as Lessee;
  const updatedData: Lessee = {
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

export const deleteLessee = async (id: string): Promise<void> => {
  const docRef = doc(db, LESSEE_DB_NAME, id);
  await deleteDoc(docRef);
};

export const fetchLessees = async (
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
  let lesseesQuery = query(collection(db, LESSEE_DB_NAME), limit(pageSize));

  if (filters.fullName) {
    const normalizedFullName = normalizeSearchField(filters.fullName);
    if (normalizedFullName) {
      lesseesQuery = query(
        lesseesQuery,
        where("fullNameSearch", ">=", normalizedFullName),
        where("fullNameSearch", "<=", normalizedFullName + "\uf8ff")
      );
    }
  }

  if (filters.cpf) {
    const normalizedCpf = normalizeSearchField(filters.cpf);
    if (normalizedCpf) {
      lesseesQuery = query(
        lesseesQuery,
        where("cpfSearch", ">=", normalizedCpf),
        where("cpfSearch", "<=", normalizedCpf + "\uf8ff")
      );
    }
  }

  if (filters.rg) {
    const normalizedRg = normalizeSearchField(filters.rg);
    if (normalizedRg) {
      lesseesQuery = query(
        lesseesQuery,
        where("rgSearch", ">=", normalizedRg),
        where("rgSearch", "<=", normalizedRg + "\uf8ff")
      );
    }
  }

  if (filters.email) {
    const normalizedEmail = normalizeSearchField(filters.email);
    if (normalizedEmail) {
      lesseesQuery = query(
        lesseesQuery,
        where("emailSearch", ">=", normalizedEmail),
        where("emailSearch", "<=", normalizedEmail + "\uf8ff")
      );
    }
  }

  if (filters.cep) {
    const normalizedCep = normalizeSearchField(filters.cep);
    if (normalizedCep) {
      lesseesQuery = query(
        lesseesQuery,
        where("cepSearch", ">=", normalizedCep),
        where("cepSearch", "<=", normalizedCep + "\uf8ff")
      );
    }
  }

  // Pagination
  if (lastVisible) {
    lesseesQuery = query(lesseesQuery, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(lesseesQuery);
  const data = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Lessee
  );

  return {
    data,
    lastVisible:
      querySnapshot.docs.length > 0
        ? querySnapshot.docs[querySnapshot.docs.length - 1]
        : null,
  };
};

export async function exportLesseesToExcel(
  collectionName: string = "lessees"
): Promise<void> {
  try {
    const lesseesCollection = collection(db, collectionName);
    const querySnapshot = await getDocs(lesseesCollection);

    const lessees: Lessee[] = [];
    querySnapshot.forEach((doc) => {
      lessees.push({ id: doc.id, ...doc.data() } as Lessee);
    });

    // Converter os dados para um formato adequado para o Excel, excluindo os campos de busca
    const data = lessees.map((lessee) => {
      const {
        fullNameSearch,
        rgSearch,
        cpfSearch,
        celphoneSearch,
        emailSearch,
        cepSearch,
        ...lesseeData
      } = lessee;
      return {
        ID: lesseeData.id,
        "Nome Completo": lesseeData.fullName,
        "Estado Civil": lesseeData.maritalStatus,
        Profissão: lesseeData.profession,
        RG: lesseeData.rg,
        "Orgão Emissor": lesseeData.issuingBody,
        CPF: lesseeData.cpf,
        Celular: lesseeData.celphone,
        Email: lesseeData.email,
        Estado: lesseeData.state,
        Cidade: lesseeData.city,
        Bairro: lesseeData.neighborhood,
        Rua: lesseeData.street,
        Número: lesseeData.number,
        Complemento: lesseeData.complement,
        CEP: lesseeData.cep,
        Nota: lesseeData.note,
        "Nome Completo Parceiro": lesseeData.fullNamePartner,
        "RG Parceiro": lesseeData.rgPartner,
        "Orgão Emissor Parceiro": lesseeData.issuingBodyPartner,
        "CPF Parceiro": lesseeData.cpfPartner,
        "Celular Parceiro": lesseeData.celphonePartner,
        "Email Parceiro": lesseeData.emailPartner,
        "Estado Parceiro": lesseeData.statePartner,
        "Cidade Parceiro": lesseeData.cityPartner,
        "Bairro Parceiro": lesseeData.neighborhoodPartner,
        "Rua Parceiro": lesseeData.streetPartner,
        "Número Parceiro": lesseeData.numberPartner,
        "Complemento Parceiro": lesseeData.complementPartner,
        "CEP Parceiro": lesseeData.cepPartner,
      };
    });

    // Criar a planilha do Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lessees");

    // Gerar o arquivo Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const excelBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Criar um link para download do arquivo
    const url = window.URL.createObjectURL(excelBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lessees.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erro ao exportar lessees para Excel:", error);
  }
}
