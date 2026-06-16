import { useProducts } from '../contexts/ProductContext';

const Toast = () => {
  const { toasts, removeToast } = useProducts();

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border rounded-lg p-4 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${getToastStyles(
            toast.type
          )}`}
        >
          <span className="flex-shrink-0 text-lg font-bold">{getIcon(toast.type)}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-lg opacity-50 hover:opacity-75 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
