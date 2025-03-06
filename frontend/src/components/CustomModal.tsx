import React from 'react';
import Modal from 'react-modal';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      overlayClassName="fixed inset-0"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomModal;
