import React from 'react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, wide = false }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-[#a3a3a3] text-black p-4 border-4 border-black w-full ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#e5e5e5] p-2 border-2 border-black mb-4 flex justify-between items-center">
            <h2 className="text-lg">{title}</h2>
            <button 
                onClick={onClose} 
                className="bg-red-500 text-white w-6 h-6 border-2 border-black flex items-center justify-center font-mono hover:bg-red-600"
            >
                X
            </button>
        </div>
        <div className="bg-white p-4 border-2 border-black min-h-[200px] text-sm leading-relaxed">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;