export default function Input({ label, type = 'text', value, onChange, placeholder, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field w-full"
        {...props}
      />
    </div>
  );
}
