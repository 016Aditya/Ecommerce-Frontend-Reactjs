import { useDefaultAddress } from '../hooks/useDefaultAddress';
import { useDeleteAddress }  from '../hooks/useDeleteAddress';

/**
 * AddressCard
 *
 * Renders a single saved address with Edit / Delete / Set Default actions.
 *
 * Props:
 *   address      {object}   — form-shape address (from toFormShape)
 *   onEdit       {function} — called with the address object to open the edit form
 *   selectable   {boolean}  — Checkout mode: shows radio selector instead of actions
 *   selected     {boolean}  — highlights the card when selected in Checkout mode
 *   onSelect     {function} — called with address when user selects in Checkout mode
 */
const AddressCard = ({
  address,
  onEdit,
  selectable = false,
  selected   = false,
  onSelect,
}) => {
  const { mutate: setDefault, isPending: settingDefault } = useDefaultAddress();
  const { mutate: deleteAddr, isPending: deleting }       = useDeleteAddress();

  const handleDelete = () => {
    if (!window.confirm('Remove this address?')) return;
    deleteAddr(address.id);
  };

  return (
    <div
      className="rounded-xl transition"
      style={{
        paddingBlock: '18px',
        paddingInline: '28px',
        backgroundColor: 'var(--card-bg)',
        border: `1px solid ${ selected ? 'var(--accent)' : 'var(--border-color)' }`,
        boxShadow: selected ? '0 0 0 2px var(--accent)' : undefined,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
            {address.name}
          </span>

          {address.defaultAddress && (
            <span
              className="text-[13px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgba(99,102,241,0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              Default
            </span>
          )}
        </div>

        {selectable && (
          <input
            type="radio"
            checked={selected}
            onChange={() => onSelect?.(address)}
            className="mt-0.5 cursor-pointer accent-blue-500"
          />
        )}
      </div>

      {/* Address lines */}
      <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)', lineHeight: '22.5px' }}>
        <p>{address.phone}</p>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>{address.city}, {address.state} — {address.zipCode}</p>
        <p>{address.country}</p>
      </div>

      {/* Actions (hidden in checkout/selectable mode) */}
      {!selectable && (
        <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => onEdit?.(address)}
            className="text-xs font-medium transition hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Edit
          </button>

          {!address.defaultAddress && (
            <button
              type="button"
              disabled={settingDefault}
              onClick={() => setDefault(address.id)}
              className="text-xs font-medium transition hover:underline disabled:opacity-50"
              style={{ color: 'var(--text-secondary)' }}
            >
              {settingDefault ? 'Setting…' : 'Set as Default'}
            </button>
          )}

          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="text-xs font-medium transition hover:underline disabled:opacity-50 ml-auto"
            style={{ color: '#ef4444' }}
          >
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
