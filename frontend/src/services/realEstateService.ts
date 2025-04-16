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
