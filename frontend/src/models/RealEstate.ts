import { DocumentReference } from "firebase/firestore";
import { Owner } from "./Owner";
import { Lessee } from "./Lessee";

export interface RealEstate {
  id?: string;
  userId: string;
  municipalRegistration: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  cep: string;
  note?: string;
  realEstateKind: string;
  hasInspection: boolean;
  statusRealEstate: string;
  hasProofDocument: boolean;

  owner: DocumentReference<Owner>;
  ownerName?: string;
  lessee?: DocumentReference<Lessee>;
  lesseeName?: string;

  ownerData?: Owner | null;
  lesseeData?: Lessee | null;
}

export function createEmptyRealEstate(
  userId: string,
  owner: DocumentReference<Owner>
): RealEstate {
  return {
    userId,
    municipalRegistration: "",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    cep: "",
    realEstateKind: "",
    hasInspection: false,
    statusRealEstate: "",
    hasProofDocument: false,
    owner,
  };
}

//filtro proprietário, locatário, tipo de imóvel, numero municipal, vistoria, documentos de comprovação, busca paginada

export enum ERealEstateKind {
  House = "Casa",
  Apartment = "Apartamento",
  Commercial_Offices = "Salas comerciais",
  Store = "Loja",
  Warehouses = "Galpão",
}

export enum EStatusRealEstate {
  Available = "Disponível",
  Leased = "Alugado",
  Sold = "Vendido",
  Cancelled = "Cancelado",
}
