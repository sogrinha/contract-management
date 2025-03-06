export interface Lessee {
  id?: string;
  userId: string;
  fullName: string;
  rg: string;
  issuingBody: string; // Orgão emissor
  cpf: string;
  celphone: string;
  email: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  cep: string;
  note?: string;
  maritalStatus: string;
  profession: string;

  fullNamePartner?: string;
  rgPartner?: string;
  issuingBodyPartner?: string; // Orgão emissor
  cpfPartner?: string;
  celphonePartner?: string;
  emailPartner?: string;
  statePartner?: string;
  cityPartner?: string;
  neighborhoodPartner?: string;
  streetPartner?: string;
  numberPartner?: string;
  complementPartner?: string;
  cepPartner: string;

  //
  fullNameSearch?: string;
  rgSearch?: string;
  cpfSearch?: string;
  celphoneSearch?: string;
  emailSearch?: string;
  cepSearch?: string;
}

export const createEmptyLessee = (): Lessee => {
  return {
    userId: "",
    fullName: "",
    maritalStatus: "",
    profession: "",
    rg: "",
    issuingBody: "",
    cpf: "",
    celphone: "",
    email: "",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
    cep: "",
    note: "",

    fullNamePartner: "",
    rgPartner: "",
    issuingBodyPartner: "",
    cpfPartner: "",
    celphonePartner: "",
    emailPartner: "",
    statePartner: "",
    cityPartner: "",
    neighborhoodPartner: "",
    streetPartner: "",
    numberPartner: "",
    complementPartner: "",
    cepPartner: "",
  };
};
