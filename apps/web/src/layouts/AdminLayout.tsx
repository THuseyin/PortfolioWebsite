import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router'

import { PageMeta } from '../components/PageMeta'
import { authQueries, logoutAdmin } from '../features/auth/auth-api'
import './admin-layout.css'

export function AdminLayout() {
  const sessionQuery = useQuery(authQueries.session())
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.setQueryData(authQueries.session().queryKey, { authenticated: false })
      navigate('/', { replace: true })
    },
  })

  if (sessionQuery.isPending) {
    return <div className="admin-gate"><span>Checking session…</span></div>
  }

  if (sessionQuery.isError || !sessionQuery.data.authenticated) {
    return <Navigate replace to="/?admin=login" />
  }

  return (
    <div className="admin-shell">
      <PageMeta title={adminPageTitle(location.pathname)} description="Private publishing workspace." />
      <header className="admin-shell__header">
        <NavLink className="admin-shell__identity" to="/admin" aria-label="Admin dashboard">
          <span className="admin-shell__mark" aria-hidden="true">HT</span>
          <span className="admin-shell__identity-label">Admin</span>
        </NavLink>
        <nav aria-label="Admin navigation">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/homepage">Homepage</NavLink>
          <NavLink to="/admin/articles">Articles</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/tags">Tags</NavLink>
        </nav>
        <button
          type="button"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? 'Signing out…' : 'Logout'}
          <LogOut aria-hidden="true" />
        </button>
      </header>
      <div className="admin-shell__content"><Outlet /></div>
    </div>
  )
}

function adminPageTitle(pathname: string) {
  if (pathname.includes('/articles/') && pathname.endsWith('/edit')) return 'Edit Article / Admin'
  if (pathname.endsWith('/articles/new')) return 'New Article / Admin'
  if (pathname.includes('/homepage')) return 'Homepage / Admin'
  if (pathname.includes('/articles')) return 'Articles / Admin'
  if (pathname.includes('/categories')) return 'Categories / Admin'
  if (pathname.includes('/tags')) return 'Tags / Admin'
  return 'Dashboard / Admin'
}
