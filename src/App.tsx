import { Button } from "./components/ui/button"

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-400">
        Hello world!
      </h1>
      <Button variant={"outline"} onClick={() => alert("Button had been click")}>Click me!</Button>
    </>
  )
}

export default App
