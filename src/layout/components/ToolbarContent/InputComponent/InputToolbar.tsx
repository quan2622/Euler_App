import { PencilRuler } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Textarea } from "../../../../components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip"
import type React from "react"

interface InputProps {
  inputDataGraphRef: React.RefObject<HTMLTextAreaElement | null>,
  handleGenerateGraph: () => void
}

const InputToolbar = ({ inputDataGraphRef, handleGenerateGraph }: InputProps) => {
  return (
    <>
      <div className="whitespace-nowrap font-semibold italic">Input:</div>
      <div className="relative group">
        <Textarea
          ref={inputDataGraphRef}
          placeholder="Nhập thông tin đồ thị. Vd: A B || B C"
          className="bg-white h-[125px] resize-none"
        />
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="absolute top-1 right-1 opacity-0 group-hover:top-3 group-hover:right-3 group-hover:opacity-100 transition-all duration-150 ease-linear"
                onClick={handleGenerateGraph}
                variant={"outline"} size={"icon"}
              >
                <PencilRuler />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-100 text-zinc-800 shadow-sm shadow-gray-500">
              <p className="flex items-center font-semibold">Tạo đồ thị</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  )
}
export default InputToolbar