import { gql } from '@apollo/client';

export const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      id
      title
      description
      propertyType
      status
      price
      bedrooms
      addressLine1
      city
      createdAt
    }
  }
`;

export const CREATE_PROPERTY_MUTATION = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(createPropertyInput: $input) {
      id
      title
      description
      propertyType
      status
      price
      bedrooms
      addressLine1
      city
      createdAt
    }
  }
`;