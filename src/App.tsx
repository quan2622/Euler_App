import { Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout"
import HomePage from "./pages/home/HomePage"
import GraphPage from "./pages/graph/GraphPage"

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />} >
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<GraphPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
