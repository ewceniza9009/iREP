// frontend/src/pages/Projects.tsx

import { useQuery, useMutation } from '@apollo/client';
import { useState, FormEvent, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { GET_PROJECTS, CREATE_PROJECT_MUTATION } from '../graphql/projects';

// Define a type for a Project based on your GraphQL schema
interface Task {
  id: string;
  name: string;
  status: string;
  progress: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  tasks: Task[];
}

// Form component for creating a new project
function CreateProjectForm({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [createProject, { loading }] = useMutation(CREATE_PROJECT_MUTATION, {
    refetchQueries: [{ query: GET_PROJECTS }],
    onCompleted: () => {
      toast.success('Project created successfully!');
      onCreated();
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planning',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createProject({ variables: { input: form } });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Add New Project</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Project Name" required className="input" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Project Description" className="input h-24"></textarea>
        <select name="status" value={form.status} onChange={handleChange} className="input">
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useContext(AuthContext);
  const { loading, error, data } = useQuery<{ projects: Project[] }>(GET_PROJECTS);
  const [showForm, setShowForm] = useState(false);
  
  // Check if the user has the 'project_manager' or 'admin' role
  const canCreateProjects = user?.roles.includes('project_manager') || user?.roles.includes('admin');

  if (loading) return <p className="p-8 text-center text-gray-500">Loading projects...</p>;
  if (error) return <p className="p-8 text-red-600 bg-red-50 rounded-lg">Error: {error.message}</p>;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Projects</h1>
        {canCreateProjects && (
          <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Project
          </button>
        )}
      </div>

      {showForm && canCreateProjects && <CreateProjectForm onCreated={() => setShowForm(false)} onClose={() => setShowForm(false)} />}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.projects.length === 0 ? (
          <p className="text-gray-500 md:col-span-3 text-center">No projects found. Add a new one to get started!</p>
        ) : (
          data?.projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
                <span className="text-sm text-gray-500">
                  {project.tasks.length} tasks
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}