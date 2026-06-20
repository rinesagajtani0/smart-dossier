import { useState } from 'react';
import type { FormEvent } from 'react';
import { INTENT_MAPPINGS } from '../services/processService';
import type { ProcedureGeneratorInput } from '../services/processService';
import './ProcedureGeneratorForm.css';

const PROPERTY_TYPES = ['Apartment', 'House', 'Land', 'Commercial'];

interface ProcedureGeneratorFormProps {
  onGenerate: (input: ProcedureGeneratorInput) => void;
  loading: boolean;
}

export function ProcedureGeneratorForm({ onGenerate, loading }: ProcedureGeneratorFormProps) {
  const [userIntent, setUserIntent] = useState(INTENT_MAPPINGS[0].id);
  const [municipality, setMunicipality] = useState('');
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGenerate({ userIntent, municipality, propertyType });
  }

  return (
    <form className="procedure-form" onSubmit={handleSubmit}>
      <label className="procedure-form__field">
        <span>User Intent</span>
        <select value={userIntent} onChange={(event) => setUserIntent(event.target.value)}>
          {INTENT_MAPPINGS.map((mapping) => (
            <option key={mapping.id} value={mapping.id}>
              {mapping.label}
            </option>
          ))}
        </select>
      </label>

      <label className="procedure-form__field">
        <span>Municipality</span>
        <input
          type="text"
          placeholder="e.g. Prishtina"
          value={municipality}
          onChange={(event) => setMunicipality(event.target.value)}
        />
      </label>

      <label className="procedure-form__field">
        <span>Property Type</span>
        <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="procedure-form__submit" disabled={loading}>
        {loading ? 'Generating…' : 'Generate Procedure'}
      </button>
    </form>
  );
}
