export default function Button({ children, onClick, disabled, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
