import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { toast } from 'react-toastify';

export type EntityType = 'owners' | 'lessees' | 'realEstates' | 'contracts';

export interface FileMetadata {
    name: string;
    url: string;
    path: string;
    type: string;
    size: number;
    uploadDate: Date;
}

export const storageService = {
    async uploadFile(
        file: File,
        entityType: EntityType,
        entityId: string,
        customFileName?: string
    ): Promise<FileMetadata> {
        try {
            const fileName = customFileName || file.name;
            const filePath = `${entityType}/${entityId}/${fileName}`;
            const fileRef = ref(storage, filePath);

            const uploadResult = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(uploadResult.ref);

            return {
                name: fileName,
                url,
                path: filePath,
                type: file.type,
                size: file.size,
                uploadDate: new Date()
            };
        } catch (error) {
            console.error('Erro ao fazer upload do arquivo:', error);
            toast.error('Erro ao fazer upload do arquivo. Tente novamente.');
            throw error;
        }
    },

    async listFiles(entityType: EntityType, entityId: string): Promise<FileMetadata[]> {
        try {
            const folderRef = ref(storage, `${entityType}/${entityId}`);
            const filesList = await listAll(folderRef);

            const filesData = await Promise.all(
                filesList.items.map(async (fileRef) => {
                    const url = await getDownloadURL(fileRef);
                    const metadata = await getMetadata(fileRef);

                    return {
                        name: fileRef.name,
                        url,
                        path: fileRef.fullPath,
                        type: metadata.contentType || '',
                        size: metadata.size,
                        uploadDate: new Date(metadata.timeCreated)
                    };
                })
            );

            return filesData;
        } catch (error) {
            console.error('Erro ao listar arquivos:', error);
            toast.error('Erro ao listar arquivos. Tente novamente.');
            throw error;
        }
    },

    async deleteFile(filePath: string): Promise<void> {
        try {
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error);
            toast.error('Erro ao excluir arquivo. Tente novamente.');
            throw error;
        }
    },

    async downloadFile(url: string, fileName: string): Promise<void> {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            toast.error('Erro ao baixar arquivo. Tente novamente.');
            throw error;
        }
    }
}; 
