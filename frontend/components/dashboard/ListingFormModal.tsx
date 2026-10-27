"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { getMakes, getModels } from "@/lib/api/catalog";
import { createListing, updateListing } from "@/lib/api/listings";
import { getCities, getStates } from "@/lib/api/locations";
import {
  ApiError,
  type CatalogMake,
  type CatalogModel,
  type LocationCity,
  type LocationState,
  type MyListing,
} from "@/lib/api/types";
import LocationCombobox from "./LocationCombobox";
import {
  ACCIDENT_HISTORY,
  BODY_TYPES,
  CONDITIONS,
  FUEL_TYPES,
  INSURANCE_STATUS,
  LOAN_STATUS,
  REQUIRED_PHOTO_SLOTS,
  RC_AVAILABILITY,
  SERVICE_HISTORY,
  STEP_TITLES,
  TRANSMISSIONS,
  buildListingFormData,
  emptyListingFormValues,
  existingPhotoUrl,
  listingToFormValues,
  photoSlotLabel,
  validateStep,
  type ListingFormValues,
  type ListingPhotoFiles,
  type RequiredPhotoSlot,
} from "./listingFormSteps";

type ListingFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  listing?: MyListing | null;
  onClose: () => void;
  onSuccess: (listing: MyListing) => void;
};

const selectClassName =
  "border border-[var(--line)] bg-white text-[var(--ink)] rounded-[0.25rem] px-[0.85rem] py-[0.7rem] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(47,111,237,0.15)]";

function FieldSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ListingFormModal({
  open,
  mode,
  listing,
  onClose,
  onSuccess,
}: ListingFormModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ListingFormValues>(emptyListingFormValues);
  const [photos, setPhotos] = useState<ListingPhotoFiles>({});
  const [states, setStates] = useState<LocationState[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!open) return;

    setStep(0);
    setError(null);
    setPhotos({});
    setCities([]);
    setMakes([]);
    setModels([]);
    setSelectedMakeId(null);
    setLoadingCities(false);
    setLoadingMakes(false);
    setLoadingModels(false);
    setValues(
      mode === "edit" && listing
        ? listingToFormValues(listing)
        : emptyListingFormValues()
    );

    let active = true;
    (async () => {
      setLoadingLocations(true);
      try {
        const res = await getStates();
        if (!active) return;
        setStates(res.states);

        if (mode === "edit" && listing) {
          const stateName = listing.state || listing.city?.state || "";
          const matched = res.states.find(
            (s) => s.name.toLowerCase() === stateName.toLowerCase()
          );
          if (matched) {
            setValues((prev) => ({
              ...prev,
              state: matched.name,
              stateId: matched._id,
            }));
            setLoadingCities(true);
            try {
              const cityRes = await getCities({ state: matched.name });
              if (!active) return;
              setCities(cityRes.cities);
            } finally {
              if (active) setLoadingCities(false);
            }
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load locations"
          );
        }
      } finally {
        if (active) setLoadingLocations(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, mode, listing]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    (async () => {
      setLoadingMakes(true);
      try {
        const nextMakes = await getMakes();
        if (!active) return;
        setMakes(nextMakes.makes || []);
      } catch {
        if (active) setError("Failed to load vehicle makes");
      } finally {
        if (active) setLoadingMakes(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const currentMake = values.make;
    if (!currentMake) {
      setSelectedMakeId(null);
      return;
    }

    const matched = makes.find(
      (m) => m.name.toLowerCase() === currentMake.toLowerCase()
    );
    if (matched) {
      setSelectedMakeId(matched._id);
      if (matched.name !== currentMake) {
        setValues((prev) => ({ ...prev, make: matched.name }));
      }
      return;
    }

    if (loadingMakes) return;

    const isLegacyEdit =
      mode === "edit" &&
      listing?.make != null &&
      listing.make.toLowerCase() === currentMake.toLowerCase();

    if (isLegacyEdit) {
      setSelectedMakeId(null);
      return;
    }

    if (makes.length === 0) return;

    setSelectedMakeId(null);
    setModels([]);
    setValues((prev) =>
      prev.make || prev.model ? { ...prev, make: "", model: "" } : prev
    );
  }, [open, values.make, makes, loadingMakes, mode, listing]);

  useEffect(() => {
    if (!open || !selectedMakeId) {
      if (!selectedMakeId) setModels([]);
      return;
    }

    let active = true;
    (async () => {
      setLoadingModels(true);
      try {
        const nextModels = await getModels({ make: selectedMakeId });
        if (!active) return;
        setModels(nextModels.models || []);
      } catch {
        if (active) setError("Failed to load vehicle models");
      } finally {
        if (active) setLoadingModels(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, selectedMakeId]);

  useEffect(() => {
    if (!open || !values.model || loadingModels) return;

    const currentModel = values.model;
    const canonical = models.find(
      (m) => m.name.toLowerCase() === currentModel.toLowerCase()
    );
    if (canonical) {
      if (canonical.name !== currentModel) {
        setValues((prev) => ({ ...prev, model: canonical.name }));
      }
      return;
    }

    if (models.length === 0 && selectedMakeId) return;

    const isLegacyEdit =
      mode === "edit" &&
      listing?.model != null &&
      listing.model.toLowerCase() === currentModel.toLowerCase();

    if (!isLegacyEdit && models.length > 0) {
      setValues((prev) => (prev.model ? { ...prev, model: "" } : prev));
    }
  }, [
    open,
    values.model,
    models,
    loadingModels,
    selectedMakeId,
    mode,
    listing,
  ]);

  function onMakeChange(makeName: string) {
    const matched = makes.find((m) => m.name === makeName) ?? null;
    setSelectedMakeId(matched?._id ?? null);
    setModels([]);
    setValues((prev) => ({
      ...prev,
      make: makeName,
      model: "",
    }));
  }

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, submitting]);

  function setField<K extends keyof ListingFormValues>(
    key: K,
    value: ListingFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onStateChange(stateId: string) {
    const selected = states.find((s) => s._id === stateId);
    setValues((prev) => ({
      ...prev,
      stateId,
      state: selected?.name ?? "",
      city: "",
    }));
    setCities([]);
    if (!stateId || !selected?.name) {
      setLoadingCities(false);
      return;
    }
    setLoadingCities(true);
    setError(null);
    try {
      const res = await getCities({ state: selected.name });
      setCities(res.cities);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load cities"
      );
    } finally {
      setLoadingCities(false);
    }
  }

  function onPhotoChange(
    slot: RequiredPhotoSlot,
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] ?? null;
    setPhotos((prev) => ({ ...prev, [slot]: file }));
  }

  function onOtherPhotosChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 10) : [];
    setPhotos((prev) => ({ ...prev, other: files }));
  }

  function goNext() {
    const message = validateStep(step, values);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < STEP_TITLES.length - 1) {
      goNext();
      return;
    }

    const message = validateStep(step, values);
    if (message) {
      setError(message);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData =
        mode === "edit"
          ? buildListingFormData(values, photos)
          : buildListingFormData(values, photos, { status: "Live" });
      const res =
        mode === "edit" && listing
          ? await updateListing(listing._id, formData)
          : await createListing(formData);
      onSuccess(res.listing);
      toast.success(
        mode === "edit" ? "Listing updated" : "Listing created"
      );
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const missing =
          err.data &&
          typeof err.data === "object" &&
          "missing" in err.data &&
          Array.isArray((err.data as { missing: unknown }).missing)
            ? (err.data as { missing: string[] }).missing.join(", ")
            : null;
        const msg = missing ? `${err.message}: ${missing}` : err.message;
        setError(msg);
        toast.error(msg);
      } else {
        const msg =
          mode === "edit" ? "Failed to update listing" : "Failed to create listing";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-[rgba(18,22,28,0.55)] p-0 md:items-center md:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex h-full w-full max-w-3xl flex-col bg-[var(--surface)] shadow-xl outline-none md:h-auto md:max-h-[90vh] md:rounded-md"
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-4 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="font-display text-xl text-[var(--ink)] sm:text-2xl">
              {mode === "edit" ? "Edit listing" : "Create listing"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}
            </p>
            <ol className="mt-3 flex flex-wrap gap-2" aria-hidden="true">
              {STEP_TITLES.map((title, index) => (
                <li
                  key={title}
                  className={`h-1.5 w-10 rounded-full sm:w-14 ${
                    index <= step ? "bg-[var(--accent)]" : "bg-[var(--line)]"
                  }`}
                />
              ))}
            </ol>
          </div>
          <button
            type="button"
            className="btn-ghost shrink-0 px-3 py-2 text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Close
          </button>
        </header>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {error ? <p className="form-error mb-4">{error}</p> : null}

            {step === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <LocationCombobox
                  id="listing-state"
                  label="State"
                  valueId={values.stateId}
                  valueLabel={values.state}
                  options={states.map((s) => ({ id: s._id, label: s.name }))}
                  loading={loadingLocations}
                  placeholder="Type to search state…"
                  required
                  onSelect={(opt) => {
                    void onStateChange(opt?.id ?? "");
                  }}
                />
                <LocationCombobox
                  id="listing-city"
                  label="City"
                  valueId={values.city}
                  valueLabel={
                    cities.find((c) => c._id === values.city)?.name ?? ""
                  }
                  options={cities.map((c) => ({ id: c._id, label: c.name }))}
                  disabled={!values.stateId}
                  loading={loadingCities}
                  placeholder={
                    !values.stateId
                      ? "Select state first…"
                      : "Type to search city…"
                  }
                  emptyHint={
                    values.stateId && !loadingCities && cities.length === 0
                      ? "No cities found for this state."
                      : undefined
                  }
                  required
                  onSelect={(opt) => {
                    setField("city", opt?.id ?? "");
                  }}
                />
                <div className="field">
                  <label htmlFor="listing-my">Manufacturing year</label>
                  <input
                    id="listing-my"
                    type="number"
                    inputMode="numeric"
                    value={values.manufacturingYear}
                    onChange={(e) => setField("manufacturingYear", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="listing-make">Make</label>
                  <select
                    id="listing-make"
                    className={selectClassName}
                    value={values.make}
                    onChange={(e) => onMakeChange(e.target.value)}
                    required
                    disabled={loadingMakes}
                  >
                    <option value="">
                      {loadingMakes ? "Loading makes…" : "Select make…"}
                    </option>
                    {values.make &&
                    !makes.some(
                      (m) => m.name.toLowerCase() === values.make.toLowerCase()
                    ) ? (
                      <option value={values.make}>{values.make}</option>
                    ) : null}
                    {makes.map((make) => (
                      <option key={make._id} value={make.name}>
                        {make.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="listing-model">Model</label>
                  <select
                    id="listing-model"
                    className={selectClassName}
                    value={values.model}
                    onChange={(e) => setField("model", e.target.value)}
                    required
                    disabled={!values.make || loadingModels}
                  >
                    <option value="">
                      {!values.make
                        ? "Select make first…"
                        : loadingModels
                          ? "Loading models…"
                          : "Select model…"}
                    </option>
                    {values.model &&
                    !models.some(
                      (m) =>
                        m.name.toLowerCase() === values.model.toLowerCase()
                    ) ? (
                      <option value={values.model}>{values.model}</option>
                    ) : null}
                    {models.map((model) => (
                      <option key={model._id} value={model.name}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="listing-ry">Registration year</label>
                  <input
                    id="listing-ry"
                    type="number"
                    inputMode="numeric"
                    value={values.registrationYear}
                    onChange={(e) => setField("registrationYear", e.target.value)}
                    required
                  />
                </div>
                <FieldSelect
                  id="listing-fuel"
                  label="Fuel type"
                  value={values.fuelType}
                  onChange={(v) => setField("fuelType", v)}
                  options={FUEL_TYPES}
                />
                <FieldSelect
                  id="listing-transmission"
                  label="Transmission"
                  value={values.transmission}
                  onChange={(v) => setField("transmission", v)}
                  options={TRANSMISSIONS}
                />
                <FieldSelect
                  id="listing-body"
                  label="Body type"
                  value={values.bodyType}
                  onChange={(v) => setField("bodyType", v)}
                  options={BODY_TYPES}
                />
                <div className="field">
                  <label htmlFor="listing-km">Kilometres driven</label>
                  <input
                    id="listing-km"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={values.kilometresDriven}
                    onChange={(e) => setField("kilometresDriven", e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label htmlFor="listing-colour">Colour</label>
                  <input
                    id="listing-colour"
                    value={values.colour}
                    onChange={(e) => setField("colour", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="listing-price">Asking price</label>
                  <input
                    id="listing-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={values.askingPrice}
                    onChange={(e) => setField("askingPrice", e.target.value)}
                  />
                </div>
                <div className="field sm:col-span-2">
                  <label className="flex items-center gap-2 font-medium text-[var(--ink)]">
                    <input
                      type="checkbox"
                      checked={values.negotiable}
                      onChange={(e) => setField("negotiable", e.target.checked)}
                      className="size-4"
                    />
                    Price is negotiable
                  </label>
                </div>
                <FieldSelect
                  id="listing-condition"
                  label="Overall condition"
                  value={values.overallCondition}
                  onChange={(v) => setField("overallCondition", v)}
                  options={CONDITIONS}
                />
                <FieldSelect
                  id="listing-accident"
                  label="Accident history"
                  value={values.accidentHistory}
                  onChange={(v) => setField("accidentHistory", v)}
                  options={ACCIDENT_HISTORY}
                />
                <FieldSelect
                  id="listing-insurance"
                  label="Insurance status"
                  value={values.insuranceStatus}
                  onChange={(v) => setField("insuranceStatus", v)}
                  options={INSURANCE_STATUS}
                />
                <FieldSelect
                  id="listing-service"
                  label="Service history"
                  value={values.serviceHistory}
                  onChange={(v) => setField("serviceHistory", v)}
                  options={SERVICE_HISTORY}
                />
                <FieldSelect
                  id="listing-rc"
                  label="RC availability"
                  value={values.rcAvailability}
                  onChange={(v) => setField("rcAvailability", v)}
                  options={RC_AVAILABILITY}
                />
                <FieldSelect
                  id="listing-loan"
                  label="Loan / hypothecation"
                  value={values.loanHypothecationStatus}
                  onChange={(v) => setField("loanHypothecationStatus", v)}
                  options={LOAN_STATUS}
                />
                <div className="field sm:col-span-2">
                  <label htmlFor="listing-info">Additional information</label>
                  <textarea
                    id="listing-info"
                    rows={4}
                    maxLength={2000}
                    value={values.additionalInformation}
                    onChange={(e) =>
                      setField("additionalInformation", e.target.value)
                    }
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="field">
                    <label htmlFor="listing-variant">Variant</label>
                    <input
                      id="listing-variant"
                      value={values.variant}
                      onChange={(e) => setField("variant", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="listing-owners">Number of owners</label>
                    <input
                      id="listing-owners"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={values.numberOfOwners}
                      onChange={(e) => setField("numberOfOwners", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--ink)]">
                    Photos
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Optional for Draft. All eight main slots are required to go Live.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {REQUIRED_PHOTO_SLOTS.map((slot) => {
                      const existing =
                        mode === "edit"
                          ? existingPhotoUrl(listing?.photos, slot)
                          : null;
                      const picked = photos[slot];
                      return (
                        <div key={slot} className="field">
                          <label htmlFor={`photo-${slot}`}>
                            {photoSlotLabel(slot)}
                          </label>
                          {existing && !picked ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={existing}
                              alt={photoSlotLabel(slot)}
                              className="mb-2 aspect-[4/3] w-full max-w-[12rem] border border-[var(--line)] object-cover"
                            />
                          ) : null}
                          {picked ? (
                            <p className="mb-1 text-xs text-[var(--muted)]">
                              Selected: {picked.name}
                            </p>
                          ) : null}
                          <input
                            id={`photo-${slot}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => onPhotoChange(slot, e)}
                          />
                        </div>
                      );
                    })}
                    <div className="field sm:col-span-2">
                      <label htmlFor="photo-other">
                        {photoSlotLabel("other")} (up to 10)
                      </label>
                      <input
                        id="photo-other"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onOtherPhotosChange}
                      />
                      {photos.other?.length ? (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {photos.other.length} file(s) selected
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 sm:px-6">
            <button
              type="button"
              className="btn-ghost"
              onClick={step === 0 ? onClose : goBack}
              disabled={submitting}
            >
              {step === 0 ? "Cancel" : "Back"}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {step < STEP_TITLES.length - 1
                ? "Next"
                : submitting
                  ? mode === "edit"
                    ? "Saving…"
                    : "Creating…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Create listing"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
