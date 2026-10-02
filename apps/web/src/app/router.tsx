import { createBrowserRouter } from 'react-router'

import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminArticlesPage } from '../pages/admin/AdminArticlesPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { ArticleDetailPage } from '../pages/public/ArticleDetailPage'
import { ArticlesPage } from '../pages/public/ArticlesPage'
import { CategoryArticlesPage } from '../pages/public/CategoryArticlesPage'
import { HomePage } from '../pages/public/HomePage'
import { TagArticlesPage } from '../pages/public/TagArticlesPage'
import { NotFoundPage } from '../pages/shared/NotFoundPage'

export const router = createBrowserRouter([
  { index: true, element: <HomePage /> },
  {
    element: <PublicLayout />,
    children: [
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'articles/:slug', element: <ArticleDetailPage /> },
      { path: 'categories/:categorySlug', element: <CategoryArticlesPage /> },
      { path: 'tags/:tagSlug', element: <TagArticlesPage /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'articles', element: <AdminArticlesPage /> },
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
  { path: '*', element: <NotFoundPage /> },
])
