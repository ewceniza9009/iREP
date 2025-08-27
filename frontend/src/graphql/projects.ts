import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      createdAt
      tasks {
        id
        name
        status
        progress
      }
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(createProjectInput: $input) {
      id
      name
      description
      status
      createdAt
    }
  }
`;