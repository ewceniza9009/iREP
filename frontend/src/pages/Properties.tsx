// frontend/src/pages/Properties.tsx

import { useQuery, useMutation } from '@apollo/client';
import { useState, FormEvent, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { GET_PROPERTIES, CREATE_PROPERTY_MUTATION } from '../graphql/properties';
import { Property } from '../types'; // Assuming Property type is defined in types.ts

// Form component for creating a new property
function CreatePropertyForm({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [createProperty, { loading }] = useMutation(CREATE_PROPERTY_MUTATION, {
    refetchQueries: [{ query: GET_PROPERTIES }],
    onCompleted: () => {
      toast.success('Property created successfully!');
      onCreated();
    },
    onError: (error) => {
      toast.error(`Failed to create property: ${error.message}`);
    },
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: 'residential',
    price: 0,
    bedrooms: 0,
    addressLine1: '',
    city: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createProperty({ variables: { input: form } });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Add New Property</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Property Title" required className="input" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Property Description" className="input h-24"></textarea>
        <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input">
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="land">Land</option>
        </select>
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" className="input" />
        <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} placeholder="Bedrooms" className="input" />
        <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Address" required className="input" />
        <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" required className="input" />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Property'}
        </button>
      </form>
    </div>
  );
}

export default function PropertiesPage() {
  const { user } = useContext(AuthContext);
  const { loading, error, data } = useQuery<{ properties: Property[] }>(GET_PROPERTIES);
  const [showForm, setShowForm] = useState(false);
  
  // Example permission: Only admins can create properties
  const canCreateProperties = user?.roles.includes('admin');

  if (loading) return <p className="p-8 text-center text-gray-500">Loading properties...</p>;
  if (error) return <p className="p-8 text-red-600 bg-red-50 rounded-lg">Error: {error.message}</p>;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Properties</h1>
        {canCreateProperties && (
          <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Property
          </button>
        )}
      </div>

      {showForm && canCreateProperties && <CreatePropertyForm onCreated={() => setShowForm(false)} onClose={() => setShowForm(false)} />}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.properties.length === 0 ? (
          <p className="text-gray-500 md:col-span-3 text-center">No properties found. Add a new one to get started!</p>
        ) : (
          data?.properties.map((property) => (
            <div key={property.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-bold text-gray-800">{property.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{property.addressLine1}, {property.city}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  property.status === 'available' ? 'bg-green-100 text-green-800' :
                  property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
                <span className="text-lg font-semibold text-gray-700">
                  ${property.price?.toLocaleString() ?? 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}