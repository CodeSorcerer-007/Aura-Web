import React from 'react';
import { motion } from 'framer-motion';

export const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="w-full max-w-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 text-center"
            >
                <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
                <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
                <div className="flex gap-4">
                    <button 
                        onClick={onCancel} 
                        className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg"
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
