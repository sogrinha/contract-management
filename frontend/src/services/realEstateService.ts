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
} from "firebase/firestore";
import { RealEstate } from "../models/RealEstate";

const realEstateCollection = collection(db, "realEstates");

// Criar um novo imóvel
export const createRealEstate = async (realEstate: RealEstate) => {
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
      console.warn("Imóvel não encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);
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

// Buscar imóveis com filtros e paginação
export const getRealEstates = async (
  filters: {
    owner?: DocumentReference;
    lessee?: DocumentReference;
    realEstateKind?: string;
    municipalRegistration?: string;
    inspection?: boolean;
    hasProofDocument?: boolean;
  },
  lastVisible?: any,
  pageSize: number = 10
) => {
  let q = query(
    realEstateCollection,
    orderBy("municipalRegistration"),
    limit(pageSize)
  );

  if (filters.owner) q = query(q, where("owner", "==", filters.owner));
  if (filters.lessee) q = query(q, where("lessee", "==", filters.lessee));
  if (filters.realEstateKind)
    q = query(q, where("realEstateKind", "==", filters.realEstateKind));
  if (filters.municipalRegistration)
    q = query(
      q,
      where("municipalRegistration", "==", filters.municipalRegistration)
    );
  if (filters.inspection !== undefined)
    q = query(q, where("inspection", "==", filters.inspection));
  if (filters.hasProofDocument !== undefined)
    q = query(q, where("hasProofDocument", "==", filters.hasProofDocument));
  if (lastVisible) q = query(q, startAfter(lastVisible));

  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  return {
    data: snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as RealEstate
    ),
    lastDoc,
  };
};
