import { useState, useEffect } from 'react';
import { userService }        from '@/services/userService';
import { useAuth }            from '@/features/auth/hooks/useAuth';
import { useQueryClient }     from '@tanstack/react-query';
import { queryKeys }          from '@/lib/queryKeys';

// ── helpers ──────────────────────────────────────────────────────────────────
const empty = (v) => !v || String(v).trim() === '';

const PINCODE_API_URL = 'https://api.postalpincode.in/pincode';

const buildInitial = (profile, user) => ({
  firstName:    profile?.firstName    ?? user?.firstName    ?? '',
  lastName:     profile?.lastName     ?? user?.lastName     ?? '',
  phoneNumber:  profile?.phoneNumber  ?? user?.phoneNumber  ?? '',
  addrFullName: profile?.address?.fullName      ?? '',
  addrPhone:    profile?.address?.phoneNumber   ?? '',
  addrLine1:    profile?.address?.addressLine1  ?? '',
  addrLine2:    profile?.address?.addressLine2  ?? '',
  city:         profile?.address?.city          ?? '',
  state:        profile?.address?.state         ?? '',
  zipCode:      profile?.address?.zipCode       ?? '',
  country:      profile?.address?.country       ?? 'India',
});

// ── ProfileForm ───────────────────────────────────────────────────────────────
const ProfileForm = ({ profile, user, onSuccess, onError }) => {
  const { updateUser }   = useAuth();
  const queryClient      = useQueryClient();
  const [fields, setFields]   = useState(() => buildInitial(profile, user));
  const [loading, setLoading] = useState(false);

  // PIN code → city/state auto-fill lookup
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError,   setPinError]   = useState('');

  useEffect(() => {
    setFields(buildInitial(profile, user));
    setPinError('');
  }, [profile, user]);

  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const fetchPincodeDetails = async (pin) => {
    setPinLoading(true);
    setPinError('');
    try {
      const res  = await fetch(`${PINCODE_API_URL}/${pin}`);
      const data = await res.json();
      const result   = data?.[0];
      const postOffice = result?.PostOffice?.[0];

      if (result?.Status === 'Success' && postOffice) {
        // Guard against a stale response if the user has since changed the PIN.
        setFields((prev) => (prev.zipCode !== pin ? prev : {
          ...prev,
          city:    postOffice.District,
          state:   postOffice.State,
          country: 'India',
        }));
      } else {
        setFields((prev) => (prev.zipCode !== pin ? prev : { ...prev, city: '', state: '' }));
        setPinError('Invalid Indian PIN code');
      }
    } catch {
      setFields((prev) => (prev.zipCode !== pin ? prev : { ...prev, city: '', state: '' }));
      setPinError('Invalid Indian PIN code');
    } finally {
      setPinLoading(false);
    }
  };

  const handlePinChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFields((prev) => ({ ...prev, zipCode: digitsOnly }));
    setPinError('');

    if (digitsOnly.length === 6) {
      fetchPincodeDetails(digitsOnly);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (empty(fields.firstName)) { onError('First name is required.'); return; }
    if (empty(fields.lastName))  { onError('Last name is required.');  return; }

    setLoading(true);
    try {
      const payload = {
        firstName:   fields.firstName.trim(),
        lastName:    fields.lastName.trim(),
        phoneNumber: fields.phoneNumber.trim() || undefined,
        ...(!empty(fields.addrLine1) && {
          address: {
            fullName:     fields.addrFullName.trim() || undefined,
            phoneNumber:  fields.addrPhone.trim()    || undefined,
            addressLine1: fields.addrLine1.trim(),
            addressLine2: fields.addrLine2.trim()    || undefined,
            city:         fields.city.trim()         || undefined,
            state:        fields.state.trim()        || undefined,
            zipCode:      fields.zipCode.trim()      || undefined,
            country:      fields.country.trim()      || undefined,
          },
        }),
      };

      const updatedUser = await userService.updateProfile(user.id, payload);
      updateUser?.(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me(user.id) });
      onSuccess('Profile updated successfully.');
    } catch (err) {
      onError(err?.message ?? 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>

      {/* ── Personal Information ── */}
      <fieldset className="profile-fieldset">
        <legend className="profile-fieldset__legend">Personal Information</legend>

        {/* First Name + Last Name in a 2-col grid */}
        <div className="profile-grid">
          <div className="profile-field">
            <label htmlFor="pf-firstName" className="profile-field__label">First Name *</label>
            <input
              id="pf-firstName"
              className="profile-field__input"
              type="text"
              value={fields.firstName}
              onChange={set('firstName')}
              placeholder="Aditya"
              required
              autoComplete="given-name"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="pf-lastName" className="profile-field__label">Last Name *</label>
            <input
              id="pf-lastName"
              className="profile-field__input"
              type="text"
              value={fields.lastName}
              onChange={set('lastName')}
              placeholder="Kumar"
              required
              autoComplete="family-name"
            />
          </div>

          {/* Phone — full width */}
          <div className="profile-field profile-field--full">
            <label htmlFor="pf-phoneNumber" className="profile-field__label">Mobile Number</label>
            <input
              id="pf-phoneNumber"
              className="profile-field__input"
              type="tel"
              value={fields.phoneNumber}
              onChange={set('phoneNumber')}
              placeholder="9876543210"
              maxLength={10}
              autoComplete="tel"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Default Delivery Address ── */}
      <fieldset className="profile-fieldset">
        <legend className="profile-fieldset__legend">Default Delivery Address</legend>

        <div className="profile-grid">
          {/* Full Name + Phone */}
          <div className="profile-field">
            <label htmlFor="pf-addrFullName" className="profile-field__label">Full Name</label>
            <input
              id="pf-addrFullName"
              className="profile-field__input"
              type="text"
              value={fields.addrFullName}
              onChange={set('addrFullName')}
              placeholder="Aditya Kumar"
              autoComplete="name"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="pf-addrPhone" className="profile-field__label">Phone</label>
            <input
              id="pf-addrPhone"
              className="profile-field__input"
              type="tel"
              value={fields.addrPhone}
              onChange={set('addrPhone')}
              placeholder="9876543210"
              maxLength={10}
              autoComplete="tel"
            />
          </div>

          {/* Address Line 1 — full width */}
          <div className="profile-field profile-field--full">
            <label htmlFor="pf-addrLine1" className="profile-field__label">Address Line 1</label>
            <input
              id="pf-addrLine1"
              className="profile-field__input"
              type="text"
              value={fields.addrLine1}
              onChange={set('addrLine1')}
              placeholder="House / Flat no., Street, Area"
              autoComplete="address-line1"
            />
          </div>

          {/* Address Line 2 — full width */}
          <div className="profile-field profile-field--full">
            <label htmlFor="pf-addrLine2" className="profile-field__label">
              Address Line 2{' '}
              <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              id="pf-addrLine2"
              className="profile-field__input"
              type="text"
              value={fields.addrLine2}
              onChange={set('addrLine2')}
              placeholder="Landmark, Near..."
              autoComplete="address-line2"
            />
          </div>

          {/* PIN Code */}
          <div className="profile-field">
            <label htmlFor="pf-zipCode" className="profile-field__label">PIN Code</label>
            <input
              id="pf-zipCode"
              className="profile-field__input"
              type="text"
              inputMode="numeric"
              value={fields.zipCode}
              onChange={handlePinChange}
              placeholder="700001"
              maxLength={6}
              autoComplete="postal-code"
            />
            {pinLoading && (
              <p className="profile-field__hint">Fetching city and state…</p>
            )}
            {!pinLoading && pinError && (
              <p className="profile-field__error">{pinError}</p>
            )}
          </div>

          {/* City */}
          <div className="profile-field">
            <label htmlFor="pf-city" className="profile-field__label">City</label>
            <input
              id="pf-city"
              className="profile-field__input"
              type="text"
              value={fields.city}
              onChange={set('city')}
              placeholder="Kolkata"
              autoComplete="address-level2"
            />
          </div>

          {/* State */}
          <div className="profile-field">
            <label htmlFor="pf-state" className="profile-field__label">State</label>
            <input
              id="pf-state"
              className="profile-field__input"
              type="text"
              value={fields.state}
              onChange={set('state')}
              placeholder="West Bengal"
              autoComplete="address-level1"
            />
          </div>

          {/* Country — read-only, always India */}
          <div className="profile-field">
            <label htmlFor="pf-country" className="profile-field__label">Country</label>
            <input
              id="pf-country"
              className="profile-field__input profile-field__input--readonly"
              type="text"
              value={fields.country || 'India'}
              readOnly
              autoComplete="country-name"
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        className="profile-btn profile-btn--primary"
        disabled={loading}
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
};

export default ProfileForm;
