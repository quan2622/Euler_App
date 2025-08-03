import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import type { Core, NodeSingular } from "cytoscape";
import AnalysisGraph from "./SiderbarContent/AnalysisGraph";
import AttributesGraph from "./SiderbarContent/AttributesGraph";

interface AppSiderbarProps {
  cyInstance: React.RefObject<Core | null>,
  startNodeRef: React.RefObject<NodeSingular | null>
  isDirectedGraph: boolean
}

const AppSiderbar = ({ cyInstance, startNodeRef, isDirectedGraph }: AppSiderbarProps) => {
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
              cyInstance={cyInstance}
              startNodeRef={startNodeRef}
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