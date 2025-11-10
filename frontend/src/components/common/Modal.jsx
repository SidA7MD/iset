// =====================================================
// frontend/src/components/common/Modal.jsx
import { X } from 'lucide-react';
import { useEffect } from 'react'; // Add this import

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  padding = 'p-6',
  className = ''
}) {
  if (!isOpen) return null;

  // Size variants with responsive max-width
  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl lg:max-w-3xl',
    xl: 'max-w-xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl',
    full: 'max-w-full mx-4 sm:mx-6' // For full width modals on mobile
  };

  // Padding variants
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-7',
    lg: 'p-7 sm:p-8 lg:p-9'
  };

  const currentPadding = typeof padding === 'string' ? paddingClasses[padding] || paddingClasses.md : paddingClasses.md;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && closeOnBackdrop) {
      onClose();
    }
  };

  // Add escape key listener when modal is open
  useEffect(() => {
    if (isOpen && closeOnBackdrop) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, closeOnBackdrop]);

  return (
    <div
      className={`modal ${isOpen ? 'modal-open' : ''}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`
          modal-box
          ${sizeClasses[size]}
          ${currentPadding}
          mx-4 sm:mx-auto
          shadow-2xl
          relative
          animate-in fade-in-90 zoom-in-90
          duration-300
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-6 sm:mb-7">
            {title && (
              <h3
                id="modal-title"
                className="font-bold text-lg sm:text-xl text-base-content pr-4"
              >
                {title}
              </h3>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost flex-shrink-0 ml-auto"
                aria-label="Close modal"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>

      {/* Backdrop with blur effect */}
      <div
        className="modal-backdrop bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      ></div>
    </div>
  );
}
