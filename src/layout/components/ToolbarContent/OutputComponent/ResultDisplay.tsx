import type React from "react";
import { ScrollArea } from "../../../../components/ui/scroll-area"
import { useGraphStatusStore } from "../../../../store/useGraphStatusStore"
import type { Core } from "cytoscape";
import clsx from "clsx";

interface ResultDisplayProps {
  cyInstance: React.RefObject<Core | null>
  scrollHeight: number,
}

const ResultDisplay = ({ cyInstance, scrollHeight }: ResultDisplayProps) => {
  const { isEndAlgorithm, result, displayStepbyStep } = useGraphStatusStore();

  return (
    <ScrollArea className={clsx(`h-[${scrollHeight}px]`, "rounded-md border border-zinc-400/30 p-2 bg-white")}>
      {isEndAlgorithm && result && result.eulerCycle.length > 0 && result.stepInfo.length > 0 &&
        <div className="flex flex-col text-xs">
          <div className="pb-1 mb-1 border-b-2 border-dashed border-zinc-400">
            <div className="font-bold italic">
              {result.isCycle ?
                "Đồ thị có chu trình Euler" : "Đồ thị có đường đi Euler"
              }
            </div>
            <span className="font-semibold italic">
              {result.eulerCycle[0] === result.eulerCycle[result.eulerCycle.length - 1] ?
                "Chu trình Euler:"
                :
                "Đường đi Euler:"
              }

            </span>
            <span className="font-medium text-green-500"> {result.eulerCycle.map(item => cyInstance.current?.$id(item).data("label")).join(" -> ")}</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold italic">Các bước thực hiện: </p>
            {result.stepInfo.map(item => (
              <div>
                <div className="space-x-1">
                  <span className="font-medium">&nbsp;&nbsp; - &nbsp;Bước {item.step}:</span>
                  <span>{item.description}</span>

                </div>
                <div className="pl-[67px] space-x-1">
                  {item.stack &&
                    <span>
                      <span className="text-blue-500">Stack:</span>
                      {item.stack.length > 0 ? ` [ ${item.stack.map(item => cyInstance.current?.$id(item).data("label")).join(", ")} ]` : " []"}
                    </span>
                  }
                  {item.eulerCycle &&
                    <span>
                      <span className="text-green-500">EC:</span>
                      {item.eulerCycle.length > 0 ? ` [ ${item.eulerCycle.map(item => cyInstance.current?.$id(item).data("label")).join(", ")} ]` : " []"}
                    </span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      }

      {result &&
        <div className="text-xs">
          {result.errMess !== "" &&
            <span className="text-red-500">{result.errMess}</span>
          }
          {result.sugMess !== "" &&
            <span className="text-orange-500">{result.sugMess}</span>
          }
        </div>
      }

      {!isEndAlgorithm && displayStepbyStep &&
        <div className="flex flex-col text-xs">
          <div className="space-y-1">
            <p className="font-semibold italic">Các bước thực hiện: </p>
            <div>
              <div className="space-x-1">
                <span className="font-medium">&nbsp;&nbsp; - &nbsp;Bước {displayStepbyStep.step}:</span>
                <span>{displayStepbyStep.description}</span>

              </div>
              <div className="pl-[67px] space-x-1">
                {displayStepbyStep.stack &&
                  <span>
                    <span className="text-blue-500">Stack:</span>
                    {displayStepbyStep.stack.length > 0 ? ` [ ${displayStepbyStep.stack.map(item => cyInstance.current?.$id(item).data("label")).join(", ")} ]` : " []"}
                  </span>
                }
                {displayStepbyStep.eulerCycle &&
                  <span>
                    <span className="text-green-500">EC:</span>
                    {displayStepbyStep.eulerCycle.length > 0 ? ` [ ${displayStepbyStep.eulerCycle.map(item => cyInstance.current?.$id(item).data("label")).join(", ")} ]` : " []"}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </ScrollArea>
  )
}
export default ResultDisplay