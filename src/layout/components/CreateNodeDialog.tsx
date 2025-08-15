import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

interface CreateNodeDialogProps {
  isOpen: boolean;
  toggleDialog: (value: boolean) => void;
  labelNode: string;
  onLableChange: (label: string) => void;
  handleCreateNewNode: () => void
}

const CreateNodeDialog = ({ isOpen, labelNode, toggleDialog, onLableChange, handleCreateNewNode }: CreateNodeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Tạo đỉnh mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="node-label-input" className="text-right"> Tên đỉnh </Label>
            <Input
              id="node-label-input"
              value={labelNode}
              onChange={(e) => onLableChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateNewNode()
                }
              }}
              className="col-span-3"
              placeholder="Nhập tên của đỉnh"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateNewNode}>Tạo đỉnh</Button>
        </DialogFooter>
      </DialogContent>

    </Dialog >
  )
}
export default CreateNodeDialog