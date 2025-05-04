export interface IElectronAPI {
    // APIs de arquivo
    saveFile: (data: { fileName: string; content: any }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    openFile: () => Promise<{ success: boolean; content?: string; filePath?: string; error?: string }>;
    downloadPDF: (data: { content: Buffer; fileName: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;

    // APIs de notificação
    showNotification: (title: string, body: string) => Promise<void>;

    // APIs de autenticação
    getAuthStatus: () => Promise<{ isAuthenticated: boolean; user?: any }>;

    // APIs de sistema
    getAppVersion: () => Promise<string>;

    // Listeners
    onUpdateAvailable: (callback: () => void) => void;
    onAuthChange: (callback: (user: any) => void) => void;

    // APIs de anexos locais
    attachmentsList: (params: { entityType: string; identifier: string; entityId: string }) => Promise<{ success: boolean; files?: string[]; error?: string }>;
    attachmentsUpload: (params: { entityType: string; identifier: string; entityId: string; name: string; content: Uint8Array }) => Promise<{ success: boolean; error?: string }>;
    attachmentsDelete: (params: { entityType: string; identifier: string; entityId: string; name: string }) => Promise<{ success: boolean; error?: string }>;
    attachmentsDownload: (params: { entityType: string; identifier: string; entityId: string; name: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
} 
