import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog"
import ResultDisplay from "./ResultDisplay"
import type { Core } from "cytoscape"

interface DetailedResultDialogProps {
  cyInstance: React.RefObject<Core | null>,
  isOpenDialog: boolean,
  scrollHeight: number,
  setIsOpenDialog: (value: boolean) => void,
}

const DetailedResultDialog = ({ cyInstance, isOpenDialog, scrollHeight, setIsOpenDialog }: DetailedResultDialogProps) => {
  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogContent
        className="max-w-3xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center mb-4">Thông tin chi tiết kết quả</DialogTitle>
          <ResultDisplay cyInstance={cyInstance} scrollHeight={scrollHeight} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
export default DetailedResultDialog