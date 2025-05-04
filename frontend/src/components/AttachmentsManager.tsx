import React, { useEffect, useState, ChangeEvent } from 'react';
import { toast } from 'react-toastify';

interface AttachmentsManagerProps {
    entityType: string;
    identifier: string;
    entityId: string;
}

export const AttachmentsManager: React.FC<AttachmentsManagerProps> = ({ entityType, identifier, entityId }) => {
    const electronAPI = (window as any).electron;
    const isElectron = Boolean(electronAPI && electronAPI.attachmentsList);

    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!isElectron) return;
        if (identifier && entityId) {
            electronAPI.attachmentsList({ entityType, identifier, entityId })
                .then((res: { success: boolean; files?: string[]; error?: string }) => {
                    if (res.success) {
                        setFiles(res.files || []);
                    } else {
                        toast.error(`Erro ao listar arquivos: ${res.error}`);
                    }
                })
                .catch((error: unknown) => {
                    console.error(error);
                    toast.error('Erro ao listar arquivos');
                });
        }
    }, [isElectron, entityType, identifier, entityId]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!isElectron || !e.target.files) return;
        setLoading(true);
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files.item(i);
            if (file && file.type === 'application/pdf') {
                const buffer = await file.arrayBuffer();
                const content = new Uint8Array(buffer);
                try {
                    const result = await electronAPI.attachmentsUpload({ entityType, identifier, entityId, name: file.name, content });
                    if (!result.success) {
                        toast.error(`Erro ao enviar ${file.name}: ${result.error}`);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error(`Erro ao enviar ${file.name}`);
                }
            }
        }
        setLoading(false);
        // Recarrega lista após upload
        if (isElectron) {
            const res = await electronAPI.attachmentsList({ entityType, identifier, entityId });
            if (res.success) setFiles(res.files || []);
        }
    };

    const handleDelete = async (name: string) => {
        if (!isElectron) return;
        try {
            const res = await electronAPI.attachmentsDelete({ entityType, identifier, entityId, name });
            if (res.success) {
                setFiles(current => current.filter(f => f !== name));
            } else {
                toast.error(`Erro ao excluir ${name}: ${res.error}`);
            }
        } catch (error) {
            console.error(error);
            toast.error(`Erro ao excluir ${name}`);
        }
    };

    const handleDownload = async (name: string) => {
        if (!isElectron) return;
        try {
            const res = await electronAPI.attachmentsDownload({ entityType, identifier, entityId, name });
            if (!res.success) {
                toast.error(`Erro ao baixar ${name}: ${res.error}`);
            }
        } catch (error) {
            console.error(error);
            toast.error(`Erro ao baixar ${name}`);
        }
    };

    if (!isElectron) {
        return <p>Funcionalidade de anexos disponível apenas na versão desktop.</p>;
    }

    return (
        <div>
            <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                disabled={loading}
            />
            {loading && <p>Processando arquivos...</p>}
            <ul>
                {files.map(name => (
                    <li key={name}>
                        {name} {' '}
                        <button onClick={() => handleDownload(name)}>Baixar</button>{' '}
                        <button onClick={() => handleDelete(name)}>Excluir</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}; 
