import { createBrowserRouter } from 'react-router'

import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminArticlesPage } from '../pages/admin/AdminArticlesPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminHomepagePage } from '../pages/admin/AdminHomepagePage'
import { AdminTagsPage } from '../pages/admin/AdminTagsPage'
import { ArticleDetailPage } from '../pages/public/ArticleDetailPage'
import { ArticlesPage } from '../pages/public/ArticlesPage'
import { CategoryArticlesPage } from '../pages/public/CategoryArticlesPage'
import { HomePage } from '../pages/public/HomePage'
import { TagArticlesPage } from '../pages/public/TagArticlesPage'
import { NotFoundPage } from '../pages/shared/NotFoundPage'
import { RouteErrorPage } from '../pages/shared/RouteErrorPage'

export const router = createBrowserRouter([
  { index: true, element: <HomePage />, errorElement: <RouteErrorPage /> },
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'articles/:slug', element: <ArticleDetailPage /> },
      { path: 'categories/:categorySlug', element: <CategoryArticlesPage /> },
      { path: 'tags/:tagSlug', element: <TagArticlesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'homepage', element: <AdminHomepagePage /> },
      { path: 'articles', element: <AdminArticlesPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'tags', element: <AdminTagsPage /> },
      {
        path: 'articles/new',
        lazy: async () => {
          const { AdminArticleEditorPage } = await import('../pages/admin/AdminArticleEditorPage')
          return { Component: AdminArticleEditorPage }
        },
      },
      {
        path: 'articles/:articleId/edit',
        lazy: async () => {
          const { AdminArticleEditorPage } = await import('../pages/admin/AdminArticleEditorPage')
          return { Component: AdminArticleEditorPage }
        },
      },
    ],
  },
])
