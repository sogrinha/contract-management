import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Contract, EContractKind } from '../models/Contract';
import { data } from 'react-router-dom';

const contractCollection = collection(db, 'contracts');

// Criar contrato
export const createContract = async (contract: Contract) => {
  contract.identifier = generateIdentifier(contract.contractKind)
  return await addDoc(contractCollection, contract);
};

// Listar contratos
export const getContracts = async () => {
  const snapshot = await getDocs(contractCollection);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Contract
  );
};

// Atualizar contrato
export const updateContract = async (
  id: string,
  updatedData: Partial<Contract>
) => {
  const contractDoc = doc(db, 'contracts', id);
  return await updateDoc(contractDoc, updatedData);
};

// Deletar contrato
export const deleteContract = async (id: string) => {
  const contractDoc = doc(db, 'contracts', id);
  return await deleteDoc(contractDoc);
};

function generateIdentifier(contractKind: string): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  const formatedDate = `${day}${month}${year}`;

  const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const kind = getContractKindAbbreviation(contractKind);

  // Monta o identificador amigável
  const idenfifier = `#${kind}${formatedDate}${randomNumber}`;

  return idenfifier;
}

function getContractKindAbbreviation(contractKind: string): string {
  switch (contractKind) {
    case EContractKind.Sale_With_Exclusivity:
      return 'VDE';
    case EContractKind.Sale_without_Exclusivity:
      return 'VDS';
    case EContractKind.Rental_With_Administration: 
      return 'ALA';
    case EContractKind.Rental: 
      return 'ALG';
    default:
      return 'UNK'; 
  }
}
