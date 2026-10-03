import { RouterProvider } from 'react-router'

import { router } from './app/router'
import { CustomCursor } from './components/CustomCursor'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <CustomCursor />
    </>
  )
}
