import { Grid3x3, Network } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { useGraphStatusStore } from "../../../store/useGraphStatusStore"
import clsx from "clsx"

interface AnalysisGraphType {
  isDirectedGraph: boolean,
}


const AnalysisGraph = ({ isDirectedGraph }: AnalysisGraphType) => {
  const { adjacencyMatrix, nodeLabels, interconnects } = useGraphStatusStore();

  return (
    <>
      <ScrollArea className="h-[82vh] p-4 pt-2 pb-2">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex space-x-2">
                <Grid3x3 />
                <span>Ma trận kề</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-2">
              {adjacencyMatrix.length === 0 ?
                <div className="text-xs text-zinc-500">Không có dữ liệu</div>
                :
                <div className="max-w-[300px]">
                  <div className="text-xs space-y-2">
                    <div className="flex mb-1">
                      <div className="w-8"></div>
                      {nodeLabels.map((label, index) => (
                        <div key={index} className="w-8 text-center font-medium text-red-600">
                          {label}
                        </div>
                      ))}
                    </div>

                    {adjacencyMatrix.map((row, i) => (
                      <div key={i} className="flex">
                        <div className="w-8 text-center font-medium text-red-600">
                          {nodeLabels[i]}
                        </div>
                        {row.map((cell, j) => (
                          <div key={j} className={clsx("w-8 text-center font-mono", cell > 0 ? "text-zinc-600 font-semibold" : "text-gray-400")}>
                            {cell}
                          </div>
                        ))}
                      </div>
                    ))}

                  </div>

                </div>
              }
            </CardContent>
          </Card>

          {isDirectedGraph &&
            <div>có hướng</div>
          }

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex space-x-2">
                <Network />
                <span> Miền Liên Thông</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-2">
              {interconnects.length === 0 ? (
                <div className="text-gray-500">Không có miền liên thông nào !</div>
              ) : (
                interconnects.map((component, index) => (
                  <div key={index} className="border-b border-gray-200 pb-2 last:border-b-1">
                    <span>{`Miền liên thông ${index + 1}: `}</span>
                    <span className="text-blue-600">{component.join(" - ")}</span>
                  </div>
                ))
              )}
              <div className="pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng số:</span>
                  <span className="text-blue-600 font-semibold">
                    {interconnects.length}
                    <span className="italic font-normal"> miền</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
export default AnalysisGraph