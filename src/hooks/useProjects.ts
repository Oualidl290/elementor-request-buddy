
import { useState, useEffect } from 'react';
import { projectsService, Project } from '@/services/projectsService';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProjects();
      setProjects(data);
      setError(null);
      console.log('Projects fetched successfully:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at'>) => {
    try {
      console.log('Creating new project:', projectData);
      const newProject = await projectsService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject
  };
};
