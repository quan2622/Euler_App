import { Outlet } from "react-router-dom"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
// import { useState } from "react"

const MainLayout = () => {
  // const [option, setOption] = useState("");

  // console.log("Check option: ", option);
  return (
    <div className="h-screen bg-red-400">
      <Outlet />
      {/* <Select value={option} onValueChange={setOption}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select> */}
    </div>
  )
}
export default MainLayout