import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Contract } from '../models/Contract';

const contractCollection = collection(db, 'contracts');

// Criar contrato
export const createContract = async (contract: Contract) => {
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
