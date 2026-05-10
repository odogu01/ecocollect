import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

const Layout = () => {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default Layout