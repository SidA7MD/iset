// =====================================================
// frontend/src/components/common/ConfirmDialog.jsx
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  if (!isOpen) return null;

  // Color variants based on type
  const typeStyles = {
    danger: {
      confirm: 'btn-error',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    warning: {
      confirm: 'btn-warning',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    info: {
      confirm: 'btn-primary',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-md mx-auto p-0 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-base-200 px-6 py-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className={`text-${type} flex-shrink-0`}>
              {styles.icon}
            </div>
            <h3 className="font-bold text-lg text-base-content">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-base-content/80 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="modal-action px-6 py-4 bg-base-100 border-t border-base-300">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              className="btn btn-outline btn-sm sm:btn-md flex-1 order-2 sm:order-1"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`btn ${styles.confirm} btn-sm sm:btn-md flex-1 order-1 sm:order-2`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
}
