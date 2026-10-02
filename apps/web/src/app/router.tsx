import { createBrowserRouter } from 'react-router'

import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminArticleEditorPage } from '../pages/admin/AdminArticleEditorPage'
import { AdminArticlesPage } from '../pages/admin/AdminArticlesPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { ArticleDetailPage } from '../pages/public/ArticleDetailPage'
import { ArticlesPage } from '../pages/public/ArticlesPage'
import { CategoryArticlesPage } from '../pages/public/CategoryArticlesPage'
import { HomePage } from '../pages/public/HomePage'
import { NotFoundPage } from '../pages/shared/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'articles/:slug', element: <ArticleDetailPage /> },
      { path: 'categories/:categorySlug', element: <CategoryArticlesPage /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'articles', element: <AdminArticlesPage /> },
      { path: 'articles/new', element: <AdminArticleEditorPage /> },
      { path: 'articles/:articleId/edit', element: <AdminArticleEditorPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
