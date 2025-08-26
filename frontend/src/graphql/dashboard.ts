import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    projectStats {
      total
      planning
      active
      completed
      onHold
    }
    propertyStats {
      total
      available
      pending
    }
  }
`;