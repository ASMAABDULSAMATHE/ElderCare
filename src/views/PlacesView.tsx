import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SavedPlace, PlaceType } from '../types';
import { uaeLocations } from '../data/defaultData';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Clock,
  Navigation,
  Accessibility,
  Building2,
  Stethoscope,
  Pill,
  Home,
  Users,
  Search,
  X,
  FileText,
} from 'lucide-react';

const isInstitutionalType = (type: string) => {
  const t = type.toLowerCase();
  return t === 'hospital' || t === 'clinic' || t === 'doctor' || t === 'mosque';
};

export const PlacesView: React.FC = () => {
  const { savedPlaces, addSavedPlace, updateSavedPlace, deleteSavedPlace, startCall } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);

  // Form state for ordinary places
  const [name, setName] = useState('');
  const [type, setType] = useState<PlaceType>('grocery');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [distance, setDistance] = useState('');
  const [accessibilityInfo, setAccessibilityInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [placeToDelete, setPlaceToDelete] = useState<{ id: string; name: string } | null>(null);

  const placeTypeIcons: Record<string, React.ReactNode> = {
    home: <Home className="w-5 h-5 text-teal-700" />,
    doctor: <Stethoscope className="w-5 h-5 text-purple-700" />,
    hospital: <Building2 className="w-5 h-5 text-rose-600" />,
    clinic: <Stethoscope className="w-5 h-5 text-teal-600" />,
    pharmacy: <Pill className="w-5 h-5 text-emerald-600" />,
    mosque: <MapPin className="w-5 h-5 text-amber-700" />,
    grocery: <Building2 className="w-5 h-5 text-blue-600" />,
    family: <Users className="w-5 h-5 text-pink-600" />,
    community: <Users className="w-5 h-5 text-indigo-600" />,
    park: <MapPin className="w-5 h-5 text-emerald-700" />,
    restaurant: <Building2 className="w-5 h-5 text-amber-800" />,
    other: <MapPin className="w-5 h-5 text-slate-600" />,
  };

  // Combine user saved places with verified UAE institutional locations (Hospitals, Clinics)
  const allAvailablePlaces: SavedPlace[] = useMemo(() => {
    const existingNames = new Set(savedPlaces.map((p) => p.name.toLowerCase()));

    const institutionalPlaces: SavedPlace[] = uaeLocations
      .filter((loc) => !existingNames.has(loc.name.toLowerCase()))
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        type: loc.type as PlaceType,
        address: `${loc.address}, ${loc.emirate}, UAE`,
        phone: loc.phone,
        openingHours: loc.timing,
        distance: loc.emirate === 'Abu Dhabi' ? 'Abu Dhabi' : 'Dubai',
        notes:
          loc.type === 'hospital'
            ? 'Specialist tertiary care & 24/7 emergency'
            : 'Outpatient consultation & healthcare service',
      }));

    return [...savedPlaces, ...institutionalPlaces];
  }, [savedPlaces]);

  const filteredPlaces = allAvailablePlaces.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedType === 'all') return true;
    if (selectedType === 'ordinary') return !isInstitutionalType(p.type);
    if (selectedType === 'hospital') return p.type === 'hospital';
    if (selectedType === 'clinic') return p.type === 'clinic' || p.type === 'doctor';
    if (selectedType === 'mosque') return p.type === 'mosque';
    if (selectedType === 'pharmacy') return p.type === 'pharmacy';
    if (selectedType === 'grocery') return p.type === 'grocery';
    if (selectedType === 'home') return p.type === 'home' || p.type === 'family';

    return p.type === selectedType;
  });

  const handleOpenAdd = () => {
    setEditingPlace(null);
    setName('');
    setType('grocery');
    setAddress('');
    setPhone('');
    setOpeningHours('');
    setDistance('');
    setAccessibilityInfo('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (place: SavedPlace) => {
    setEditingPlace(place);
    setName(place.name);
    setType(place.type);
    setAddress(place.address);
    setPhone(place.phone || '');
    setOpeningHours(place.openingHours || '');
    setDistance(place.distance || '');
    setAccessibilityInfo(place.accessibilityInfo || '');
    setNotes(place.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const payload = {
      name: name.trim(),
      type,
      address: address.trim(),
      phone: phone.trim() || undefined,
      openingHours: openingHours.trim() || undefined,
      distance: distance.trim() || undefined,
      accessibilityInfo: !isInstitutionalType(type)
        ? accessibilityInfo.trim() || 'Wheelchair accessible with step-free entry.'
        : undefined,
      notes: notes.trim() || undefined,
    };

    if (editingPlace) {
      updateSavedPlace(editingPlace.id, payload);
    } else {
      addSavedPlace(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, placeName: string) => {
    setPlaceToDelete({ id, name: placeName });
  };

  const handleConfirmDelete = () => {
    if (placeToDelete) {
      deleteSavedPlace(placeToDelete.id);
      setPlaceToDelete(null);
    }
  };

  const openGoogleMapsDirections = (place: SavedPlace) => {
    const query = encodeURIComponent(`${place.name}, ${place.address}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const accessibilityPresets = [
    'Wheelchair accessibility',
    'Accessible entrance & ramp',
    'Elevator available',
    'Accessible parking',
    'Accessible restroom',
    'Comfortable senior seating',
  ];

  const toggleAccessibilityPreset = (preset: string) => {
    if (accessibilityInfo.includes(preset)) {
      setAccessibilityInfo(
        accessibilityInfo
          .split(', ')
          .filter((item) => item !== preset)
          .join(', ')
      );
    } else {
      setAccessibilityInfo(
        accessibilityInfo ? `${accessibilityInfo}, ${preset}` : preset
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Personal Locations & Navigation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Places I Visit
          </h1>
          <p className="text-base text-slate-600 mt-1">
            Browse verified UAE hospitals, clinics, mosques, or manage your ordinary saved places with accessibility details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 shrink-0 touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          <span>Add Ordinary Place</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places by name, address, or service..."
            className="w-full min-h-[50px] pl-12 pr-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-base font-medium placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Places' },
            { id: 'ordinary', label: 'Ordinary Places' },
            { id: 'hospital', label: 'Hospitals' },
            { id: 'clinic', label: 'Clinics' },
            { id: 'mosque', label: 'Mosques' },
            { id: 'pharmacy', label: 'Pharmacies' },
            { id: 'grocery', label: 'Groceries' },
            { id: 'home', label: 'Home & Family' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id)}
              className={`min-h-[42px] px-3.5 py-1.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap shrink-0 touch-manipulation ${
                selectedType === tab.id
                  ? 'bg-white text-teal-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-4">
        {filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">No places found</h3>
            <p className="text-slate-500 text-sm">
              {searchQuery ? 'Try clearing your search query.' : 'No locations available in this category.'}
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => {
            const isInstitutional = isInstitutionalType(place.type);

            return (
              <div
                key={place.id}
                className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {placeTypeIcons[place.type] || <MapPin className="w-6 h-6 text-slate-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                          {place.name}
                        </h3>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md capitalize ${
                            place.type === 'hospital'
                              ? 'bg-rose-100 text-rose-800'
                              : place.type === 'clinic' || place.type === 'doctor'
                              ? 'bg-purple-100 text-purple-800'
                              : place.type === 'mosque'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {place.type === 'doctor' ? 'Clinic' : place.type}
                        </span>
                        {place.distance && (
                          <span className="text-xs font-semibold text-slate-500">
                            · {place.distance}
                          </span>
                        )}
                      </div>
                      <p className="text-base text-slate-600 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                        <span>{place.address}</span>
                      </p>
                      {place.openingHours && (
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{place.openingHours}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edit / Delete actions ONLY for Ordinary Places (never for Hospitals, Clinics, Mosques) */}
                  {!isInstitutional && (
                    <div className="flex items-center gap-1 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(place)}
                        className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                        title="Edit Ordinary Place"
                        aria-label={`Edit ${place.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(place.id, place.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Ordinary Place"
                        aria-label={`Delete ${place.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ACCESSIBILITY INFORMATION: Available ONLY for Ordinary Saved Places */}
                {!isInstitutional && place.accessibilityInfo && (
                  <div className="bg-teal-50/70 rounded-2xl p-4 border border-teal-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-900">
                      <Accessibility className="w-4 h-4 text-teal-700" />
                      <span>Accessibility Features (Editable)</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {place.accessibilityInfo}
                    </p>
                  </div>
                )}

                {/* INSTITUTIONAL INFO: For Hospitals, Clinics, and Mosques (NO editable accessibility section) */}
                {isInstitutional && (
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                      <span className="font-semibold">Timing / Service Hours:</span>
                      <span className="text-slate-600 font-medium">
                        {place.openingHours || 'Open 24/7 (Emergency & Reception)'}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-800 text-xs font-bold shrink-0 capitalize">
                      Verified UAE {place.type === 'doctor' ? 'Clinic' : place.type}
                    </span>
                  </div>
                )}

                {/* Notes if present */}
                {place.notes && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{place.notes}</span>
                  </div>
                )}

                {/* Primary Actions: Directions & Phone Calling for ALL Places */}
                <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openGoogleMapsDirections(place)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center gap-2 transition-transform active:scale-98 shadow-xs"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions in Google Maps</span>
                  </button>

                  {place.phone && (
                    <button
                      type="button"
                      onClick={() =>
                        startCall({
                          name: place.name,
                          relationship: `Place (${place.type})`,
                          phone: place.phone!,
                          type:
                            place.type === 'hospital' || place.type === 'clinic' || place.type === 'doctor'
                              ? 'doctor'
                              : 'caregiver',
                        })
                      }
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-teal-700" />
                      <span>Call {place.phone}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Ordinary Place Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">
                {editingPlace ? 'Edit Ordinary Place' : 'Add New Ordinary Place'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Place Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Al Manara Pharmacy, Home Villa, Lulu Hypermarket"
                  required
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    Place Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PlaceType)}
                    className="w-full min-h-[48px] px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white"
                  >
                    <option value="grocery">Grocery / Market</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="home">Home</option>
                    <option value="family">Family Member</option>
                    <option value="park">Park</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="community">Community Center</option>
                    <option value="other">Other Ordinary Place</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Address / Location *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, District, Abu Dhabi, UAE"
                  required
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="e.g. 8:00 AM – 10:00 PM, 24 Hours"
                    className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    Distance (Approx)
                  </label>
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 1.5 km"
                    className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              {/* ACCESSIBILITY DETAILS: Available and editable ONLY for ordinary places */}
              {!isInstitutionalType(type) ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-teal-900">
                      Accessibility Features (Ordinary Places Only)
                    </label>
                    <span className="text-xs text-slate-500">Elderly Accessible</span>
                  </div>

                  {/* Quick-tap presets */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {accessibilityPresets.map((preset) => {
                      const isSelected = accessibilityInfo.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => toggleAccessibilityPreset(preset)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-teal-700 border-teal-700 text-white font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {preset}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    rows={2}
                    value={accessibilityInfo}
                    onChange={(e) => setAccessibilityInfo(e.target.value)}
                    placeholder="e.g. Wheelchair access, Step-free entrance, Elevator, Accessible parking, Accessible restroom, Seating"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  ℹ️ Institutional accessibility is managed by official UAE hospital and health authority standards.
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Personal Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ground floor near main entrance. Family parking spot."
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[48px] px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-xs"
                >
                  {editingPlace ? 'Save Changes' : 'Add Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Place Confirmation Modal */}
      {placeToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Remove Saved Place?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to remove <strong>"{placeToDelete.name}"</strong> from your saved places?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPlaceToDelete(null)}
                className="min-h-[46px] rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
