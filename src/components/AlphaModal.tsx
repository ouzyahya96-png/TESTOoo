import React, { useEffect, useRef } from 'react';
import { AlphaModalProps } from '../types';
import { X } from 'lucide-react';

export const AlphaModal: React.FC<AlphaModalProps> = ({
  id,
  isOpen,
  onClose,
  type = 'center',
  title,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Center Modal layout vs Bottom Sheet layout
  const backdropStyle = "fixed inset-0 bg-[#0F0F1A]/80 backdrop-blur-md z-50 flex items-center justify-center transition-opacity duration-300";
  
  if (type === 'bottom-sheet') {
    return (
      <div 
        id={id} 
        className="fixed inset-0 bg-[#0F0F1A]/85 backdrop-blur-md z-50 flex items-end justify-center transition-all duration-300"
        onClick={onClose}
      >
        <div 
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#16213E] rounded-t-[24px] border-t border-[#E94560]/30 p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-[slide-up_0.3s_ease-out]"
          style={{
            animation: 'slide-up 300ms ease-out',
            maxHeight: '85vh',
          }}
        >
          {/* Drag Handle decorative bar for bottom sheets */}
          <div className="w-12 h-1.5 bg-[#5A5A5A] rounded-full mx-auto -mt-2 mb-2" />

          <div className="flex justify-between items-center border-b border-[#1A1A2E] pb-3">
            {title && (
              <h3 className="font-headline font-extrabold text-lg text-white tracking-wide uppercase">
                {title}
              </h3>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 bg-[#1A1A2E] hover:bg-[#E94560]/20 rounded-lg text-[#8E8E93] hover:text-white transition-colors duration-150 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 py-2">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={id} 
      className={backdropStyle}
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-4 bg-[#16213E] rounded-[24px] border border-[#1A1A2E] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.6)] flex flex-col gap-4 animate-[scale-in_0.2s_ease-out]"
        style={{
          animation: 'scale-in 200ms ease-out'
        }}
      >
        <div className="flex justify-between items-center border-b border-[#1A1A2E] pb-3">
          {title && (
            <h3 className="font-headline font-extrabold text-lg text-white tracking-wide uppercase">
              {title}
            </h3>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 bg-[#1A1A2E] hover:bg-[#E94560]/20 rounded-lg text-[#8E8E93] hover:text-white transition-colors duration-150 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-2">
          {children}
        </div>
      </div>
    </div>
  );
};

// Inject custom animations inside stylesheet if needed
export const reactModalCode = `import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AlphaModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'center' | 'bottom-sheet';
  title?: string;
  children: React.ReactNode;
}

export const AlphaModal: React.FC<AlphaModalProps> = ({ isOpen, onClose, type = 'center', title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F0F1A]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#16213E] rounded-2xl p-6 border border-[#1A1A2E] w-full max-w-md">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#1A1A2E]">
          <h3 className="font-headline font-bold text-white uppercase">{title}</h3>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};`;

export const reactNativeModalCode = `import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

interface AlphaModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'center' | 'bottom-sheet';
  title?: string;
  children: React.ReactNode;
}

export const AlphaModal: React.FC<AlphaModalProps> = ({ isOpen, onClose, type = 'center', title, children }) => {
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={type === 'bottom-sheet' ? styles.bottomSheet : styles.centerDialog}>
          <View style={styles.header}>
            <Text style={styles.title}>{title || 'ALERT'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 15, 26, 0.8)', justifyContent: 'center' },
  centerDialog: { backgroundColor: '#16213E', margin: 24, borderRadius: 16, padding: 24 },
  bottomSheet: { backgroundColor: '#16213E', marginTop: 'auto', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1A1A2E', paddingBottom: 12 },
  title: { color: '#FFFFFF', fontFamily: 'Montserrat-Bold', textTransform: 'uppercase' },
  closeBtn: { color: '#8E8E93' },
  body: { marginVertical: 12 },
});`;
