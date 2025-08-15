import { Scaling } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip"
import { useState } from "react";
import DetailedResultDialog from "./DetailedResultDialog";
import ResultDisplay from "./ResultDisplay";
import type { Core } from "cytoscape";
import { useGraphStatusStore } from "../../../../store/useGraphStatusStore";

interface OutputProps {
  cyInstance: React.RefObject<Core | null>
}

const Output = ({ cyInstance }: OutputProps) => {
  const { result } = useGraphStatusStore();
  const [isOpenDialog, setIsOpenDialog] = useState(false);


  const handleOpenDialog = (value: boolean) => {
    setIsOpenDialog(value);
  }

  return (
    <>
      <div className="whitespace-nowrap font-semibold italic">Output:</div>
      <div className="relative group">
        <ResultDisplay cyInstance={cyInstance} scrollHeight={125} />

        {result && (result.eulerCycle.length > 0 || result.stepInfo.length > 0 || result.errMess !== "" || result.sugMess !== "") &&
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="absolute top-1 right-1 opacity-0 group-hover:top-3 group-hover:right-3 group-hover:opacity-100 transition-all duration-150 ease-linear"
                  variant="outline" size="icon"
                  onClick={() => setIsOpenDialog(true)}
                >
                  <Scaling className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-100 text-zinc-800 shadow-sm shadow-gray-500">
                <p className="flex items-center font-semibold">Xem chi tiết</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }

        <DetailedResultDialog
          cyInstance={cyInstance}
          isOpenDialog={isOpenDialog}
          scrollHeight={400}
          setIsOpenDialog={handleOpenDialog}
        />
      </div>
    </>
  )
}
export default Output