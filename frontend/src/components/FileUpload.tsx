import React, { useState, useEffect } from 'react';
import { Upload, Download, Trash2, File } from 'lucide-react';
import { storageService, EntityType, FileMetadata } from '../services/storageService';

interface FileUploadProps {
    entityType: EntityType;
    entityId: string;
    onUploadComplete?: (file: FileMetadata) => void;
    acceptedFileTypes?: string;
    maxFileSize?: number; // em bytes
}

export const FileUpload: React.FC<FileUploadProps> = ({
    entityType,
    entityId,
    onUploadComplete,
    acceptedFileTypes = '.pdf',
    maxFileSize = 5 * 1024 * 1024 // 5MB padrão
}) => {
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (entityId) {
            loadFiles();
        }
    }, [entityId]);

    const loadFiles = async () => {
        try {
            const filesData = await storageService.listFiles(entityType, entityId);
            setFiles(filesData);
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.includes('pdf')) {
            alert('Por favor, selecione apenas arquivos PDF.');
            return;
        }

        if (file.size > maxFileSize) {
            alert(`O arquivo deve ter no máximo ${maxFileSize / 1024 / 1024}MB.`);
            return;
        }

        setUploading(true);
        try {
            const uploadedFile = await storageService.uploadFile(file, entityType, entityId);
            setFiles(prev => [...prev, uploadedFile]);
            onUploadComplete?.(uploadedFile);
        } catch (error) {
            console.error('Erro no upload:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file: FileMetadata) => {
        try {
            await storageService.downloadFile(file.url, file.name);
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
        }
    };

    const handleDelete = async (file: FileMetadata) => {
        if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
            try {
                await storageService.deleteFile(file.path);
                setFiles(prev => prev.filter(f => f.path !== file.path));
            } catch (error) {
                console.error('Erro ao excluir arquivo:', error);
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={acceptedFileTypes}
                    onChange={handleFileSelect}
                    disabled={uploading}
                />
                <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer"
                >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-gray-600">
                        {uploading ? 'Enviando arquivo...' : 'Arraste um arquivo ou clique para selecionar'}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                        Apenas arquivos PDF até {maxFileSize / 1024 / 1024}MB
                    </span>
                </label>
            </div>

            {files.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="divide-y">
                        {files.map((file) => (
                            <div
                                key={file.path}
                                className="flex items-center justify-between p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center space-x-3">
                                    <File className="w-6 h-6 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                        title="Baixar"
                                    >
                                        <Download />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                        title="Excluir"
                                    >
                                        <Trash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 
