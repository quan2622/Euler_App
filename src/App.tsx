import { Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout"
import HomePage from "./pages/home/HomePage"
import GraphPage from "./pages/graph/GraphPage"
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />} >
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<GraphPage />} />
        </Route>
      </Routes>
      <Toaster
        position="top-center"
        expand={false}
        richColors
        duration={3000}
        visibleToasts={5}
      />
    </>
  )
}

export default App
