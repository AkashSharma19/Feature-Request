import { useLocation } from 'react-router-dom';

export function useAdmin() {
  const location = useLocation();
  // Returns true if the URL starts with /admin
  return location.pathname.startsWith('/admin');
}
