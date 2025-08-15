import { Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout"
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />} />
      </Routes>
      <Toaster
        position="bottom-center"
        expand={false}
        richColors
        duration={2000}
        visibleToasts={5}
      />
    </>
  )
}

export default App
