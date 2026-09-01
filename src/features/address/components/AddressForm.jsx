import { useState, useEffect } from 'react';
import { addressSchema }     from '../validation/addressSchema';
import { EMPTY_FORM }        from '../utils/addressMapper';

const PINCODE_API_URL = 'https://api.postalpincode.in/pincode';

/**
 * AddressForm
 *
 * Controlled form for create and edit modes.
 * Single source of truth for address fields — used by SavedAddresses page
 * and the Checkout address step.
 *
 * Props:
 *   initialData  {object|null}  — pre-fills form in edit mode; null → blank form
 *   onSubmit     {function}     — called with validated form-shape data
 *   onCancel     {function}     — called when user dismisses the form
 *   isPending    {boolean}      — disables submit while mutation is in-flight
 *   submitLabel  {string}       — override for the submit button text
 */
const AddressForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isPending   = false,
  submitLabel = 'Save Address',
}) => {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors,   setErrors]   = useState({});

  // PIN code → city/state auto-fill lookup
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError,   setPinError]   = useState('');

  useEffect(() => {
    setFormData(initialData ? { ...EMPTY_FORM, ...initialData } : { ...EMPTY_FORM });
    setErrors({});
    setPinError('');
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const fetchPincodeDetails = async (pin) => {
    setPinLoading(true);
    setPinError('');
    try {
      const res  = await fetch(`${PINCODE_API_URL}/${pin}`);
      const data = await res.json();
      const result     = data?.[0];
      const postOffice = result?.PostOffice?.[0];

      if (result?.Status === 'Success' && postOffice) {
        // Guard against a stale response if the user has since changed the PIN.
        setFormData((prev) => (prev.zipCode !== pin ? prev : {
          ...prev,
          city:    postOffice.District,
          state:   postOffice.State,
          country: 'India',
        }));
        setErrors((prev) => { const n = { ...prev }; delete n.city; delete n.state; return n; });
      } else {
        setFormData((prev) => (prev.zipCode !== pin ? prev : { ...prev, city: '', state: '' }));
        setPinError('Invalid Indian PIN code');
      }
    } catch {
      setFormData((prev) => (prev.zipCode !== pin ? prev : { ...prev, city: '', state: '' }));
      setPinError('Invalid Indian PIN code');
    } finally {
      setPinLoading(false);
    }
  };

  const handlePinChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    handleChange('zipCode', digitsOnly);
    setPinError('');

    if (digitsOnly.length === 6) {
      fetchPincodeDetails(digitsOnly);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validated = await addressSchema.validate(formData, { abortEarly: false });
      setErrors({});
      onSubmit(validated);
    } catch (err) {
      const fieldErrors = {};
      err.inner?.forEach((fe) => { fieldErrors[fe.path] = fe.message; });
      setErrors(fieldErrors);
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-2 rounded-lg outline-none transition border text-sm ${
      hasError
        ? 'border-red-500 focus:ring-2 focus:ring-red-500/40'
        : 'focus:ring-2 focus:ring-blue-500/30'
    }`;

  const FIELDS = [
    { key: 'name',    label: 'Full Name',             required: true,  span: 1 },
    { key: 'phone',   label: 'Phone Number',           required: true,  span: 1 },
    { key: 'line1',   label: 'Address',                required: true,  span: 2 },
    { key: 'line2',   label: 'Apt / Floor (optional)', required: false, span: 2 },
    { key: 'zipCode', label: 'Pincode',                required: true,  span: 1 },
    { key: 'state',   label: 'State',                  required: true,  span: 1 },
    { key: 'city',    label: 'City',                   required: true,  span: 1 },
    { key: 'country', label: 'Country',                required: false, span: 1 },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {FIELDS.map(({ key, label, required, span }) => (
          <div key={key} className={span === 2 ? 'md:col-span-2' : ''}>
            <label
              htmlFor={`af-${key}`}
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-primary)' }}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={`af-${key}`}
              type="text"
              inputMode={key === 'zipCode' ? 'numeric' : undefined}
              maxLength={key === 'zipCode' ? 6 : undefined}
              value={formData[key] ?? ''}
              onChange={(e) =>
                key === 'zipCode'
                  ? handlePinChange(e.target.value)
                  : handleChange(key, e.target.value)
              }
              placeholder={label}
              autoComplete={key === 'zipCode' ? 'postal-code' : undefined}
              className={inputCls(!!errors[key] || (key === 'zipCode' && !!pinError))}
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                borderColor: errors[key] || (key === 'zipCode' && pinError) ? undefined : 'var(--border-color)',
              }}
            />
            {key === 'zipCode' && pinLoading && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Fetching city and state…
              </p>
            )}
            {key === 'zipCode' && !pinLoading && pinError && (
              <p className="text-red-500 text-xs mt-1">{pinError}</p>
            )}
            {!(key === 'zipCode' && (pinLoading || pinError)) && errors[key] && (
              <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Default address toggle */}
      <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={formData.defaultAddress}
          onChange={(e) => handleChange('defaultAddress', e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-blue-500"
        />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Set as default delivery address
        </span>
      </label>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition text-sm"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg text-sm font-medium transition"
          style={{
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
