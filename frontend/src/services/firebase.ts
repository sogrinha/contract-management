import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyB7jqClgsL3KgVqa4pFtXVxiDH2t5j5xPo",
    authDomain: "contract-management-f4148.firebaseapp.com",
    projectId: "contract-management-f4148",
    storageBucket: "contract-management-f4148.firebasestorage.app",
    messagingSenderId: "881777848888",
    appId: "1:881777848888:web:53d0a08069fc5db2052ccd",
    measurementId: "G-5WCSDH5G4Q"
  };
  
  // 🔹 Inicializa o Firebase com a configuração
  const app = initializeApp(firebaseConfig);
  
  // 🔹 Exporta os serviços para serem usados em outras partes do app
  export const auth = getAuth(app); // Autenticação
  export const db = getFirestore(app); // Firestore
  export const storage = getStorage(app); // Storage
  export default app;
