import { Button } from "../../components/ui/button"

interface GraphToolbarProps {
  isDirectedGraph: boolean,
  onToggleDirected: () => void,
}

const GraphToolbar = ({ isDirectedGraph, onToggleDirected }: GraphToolbarProps) => {
  return (
    <div className="h-60 w-full border-red-600 border-2">
      toolbars
      <Button variant={'outline'} onClick={onToggleDirected}>{isDirectedGraph ? "Có hướng" : "Vô hướng"}</Button>
    </div>
  )
}
export default GraphToolbar