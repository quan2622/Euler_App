import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Checkbox } from "../../../../components/ui/checkbox"
import { Label } from "../../../../components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip"
import { RUN_MODE } from "../../../../utils/constant"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { useGraphStatusStore } from "../../../../store/useGraphStatusStore"

interface RunToolProps {
  runMode: string,
  animateIsPause: boolean,
  handleChangeRunMode: (value: CheckedState) => void,
  handlePlayAlgorithm: (stepByStep: boolean) => void,
  nextStep: () => void,
  prevStep: () => void,
  resetAnimation: () => void,
}

const RunTool = ({
  runMode,
  animateIsPause,
  handleChangeRunMode,
  handlePlayAlgorithm,
  nextStep,
  prevStep,
  resetAnimation,
}: RunToolProps) => {

  const { isStepByStepStart } = useGraphStatusStore();

  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-2 pr-2">
        <Checkbox id="check-step-by-step" checked={runMode === RUN_MODE.STEP} onCheckedChange={handleChangeRunMode} />
        <Label htmlFor="check-step-by-step" className="text-sm">Step-by-step</Label>
      </div>

      <TooltipProvider delayDuration={50}>
        <Tooltip>
          <TooltipTrigger asChild>
            {!animateIsPause ?
              <Button size={"icon"}
                onClick={() => handlePlayAlgorithm(runMode === RUN_MODE.STEP)}
                className="bg-sky-600 text-white hover:bg-red-500 transition-all ease-linear duration-150">
                <Pause />
              </Button>
              :
              <Button size={"icon"}
                onClick={() => handlePlayAlgorithm(runMode === RUN_MODE.STEP)}
                className="bg-red-600 text-white hover:bg-sky-500 transition-all ease-linear duration-150">
                <Play />
              </Button>
            }
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-100 text-zinc-800 shadow-sm shadow-gray-500">
            <p className="flex items-center font-semibold">Chạy thuât toán</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button variant={"outline"} size={"icon"} onClick={prevStep} disabled={!isStepByStepStart}><SkipBack /></Button>
      <Button variant={"outline"} size={"icon"} onClick={nextStep} disabled={!isStepByStepStart}><SkipForward /></Button>
      <TooltipProvider delayDuration={50}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={"outline"} size={"icon"} onClick={resetAnimation}>
              <RotateCcw />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-100 text-zinc-800 shadow-sm shadow-gray-500">
            <p className="flex items-center font-semibold">Reset trạng thái</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
export default RunTool