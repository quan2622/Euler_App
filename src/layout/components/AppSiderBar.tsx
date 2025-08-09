import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import AnalysisGraph from "./SiderbarContent/AnalysisGraph";
import AttributesGraph from "./SiderbarContent/AttributesGraph";

interface AppSiderbarProps {
  isDirectedGraph: boolean
  handleChangeStart: (value: string) => void,
  handlePlayAlgorithm: () => void,
}

const AppSiderbar = ({ isDirectedGraph, handleChangeStart, handlePlayAlgorithm }: AppSiderbarProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="p-4 pb-0 font-semibold text-2xl text-center">
        <span className="border-b-2 border-red-600">Thông tin đồ thị</span>
      </div>
      <div className="">
        <Tabs defaultValue="attribute">
          <TabsList className="p-1 bg-zinc-200 m-4 mb-0">
            <TabsTrigger value="attribute" className="data-[state=active]:bg-zinc-100">
              Thuộc tính
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-zinc-100">
              Phân tích
            </TabsTrigger>
          </TabsList>
          <TabsContent value="attribute">
            <AttributesGraph
              isDirectedGraph={isDirectedGraph}
              handleChangeStart={handleChangeStart}
              handlePlayAlgorithm={handlePlayAlgorithm}
            />
          </TabsContent>
          <TabsContent value="analysis">
            <AnalysisGraph
              isDirectedGraph={isDirectedGraph}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}

export default AppSiderbar