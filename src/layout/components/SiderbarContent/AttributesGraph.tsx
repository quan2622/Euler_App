import { List, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { useGraphStatusStore } from "../../../store/useGraphStatusStore"
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ALGORITHM_SELECT, RUN_MODE } from "../../../utils/constant";
import { Button } from "../../../components/ui/button";
import { useGraphStore } from "../../../store/useGraphStore";
import { useState } from "react";
import type { Core, NodeSingular } from "cytoscape";

interface AttributesGraphType {
  cyInstance: React.RefObject<Core | null>,
  startNodeRef: React.RefObject<NodeSingular | null>
}

const AttributesGraph = ({ cyInstance, startNodeRef }: AttributesGraphType) => {
  const { nodeCounter, edgeCounter, nodeLabels, interconnects } = useGraphStatusStore();
  const { startNode, handleSetStartNode } = useGraphStore();

  const [selectAlgorithm, setSelectAlgorithm] = useState<string>(ALGORITHM_SELECT.HIERHOLZER);
  const [runMode, setRunMode] = useState<string>(RUN_MODE.AUTO);

  const handlePlayAlgorithm = () => {
    alert("Click");
  }

  const handleChangeStart = (value: string) => {
    if (!cyInstance.current) return;
    handleSetStartNode(value);

    const nodes = cyInstance.current?.nodes();
    nodes.removeClass("start");
    const startNode = nodes?.filter((node) => node.data("label") === value).first();
    startNode.addClass("start");
    if (startNode.nonempty() && startNode.isNode()) {
      startNodeRef.current = startNode;
    }
  }

  return (
    <>
      <div className="space-y-4 p-4 pt-2 border-b-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex space-x-2">
              <List />
              <span>Thống kê đồ thị</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs pt-2">
            <div className="flex justify-between">
              <span>Số đỉnh:</span>
              <span>{(nodeCounter - 1)! || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Số cạnh:</span>
              <span>{(edgeCounter - 1)! || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Bố cục:</span>
              {/* <span className="capitalize">{currentLayout}</span> */}
              <span className="capitalize">?currentLayout</span>
            </div>
            <div className="flex justify-between">
              <span>Đồ thị có hướng hay không:</span>
              <span>?Vô hướng</span>
            </div>
            <div className="flex justify-between">
              <span>Số miền liên thông:</span>
              <span>{interconnects.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Chu trình Euler:</span>
              <span>?Có hoặc không</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 pt-0 flex flex-col space-y-2">
        <div className="space-y-1">
          <Label htmlFor="select-algorithm">Thuật toán</Label>
          <Select value={selectAlgorithm} onValueChange={(value) => { setSelectAlgorithm(value) }}>
            <SelectTrigger className="w-full" id="select-algorithm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent defaultValue={ALGORITHM_SELECT.HIERHOLZER}>
              <SelectItem value={ALGORITHM_SELECT.HIERHOLZER}>Hierholzer</SelectItem>
              <SelectItem value={ALGORITHM_SELECT.FLEURY}>Fleury</SelectItem>
              <SelectItem value={ALGORITHM_SELECT.DFS_BASE}>DFS_Base</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="select-runMode">Chế độ chạy</Label>
          <Select value={runMode} onValueChange={(value) => { setRunMode(value) }}>
            <SelectTrigger className="w-full" id="select-runMode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RUN_MODE.AUTO}>Tự động</SelectItem>
              <SelectItem value={RUN_MODE.STEP}>Từng bước</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="select-startNode">Chọn đỉnh bắt đầu</Label>
          <Select value={startNode} onValueChange={handleChangeStart}>
            <SelectTrigger className="w-full" id="select-startNode">
              <SelectValue placeholder="Chọn đỉnh bắt đầu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" disabled>-- Chọn đỉnh bắt đầu --</SelectItem>
              {nodeLabels && nodeLabels.length > 0 && nodeLabels.map((label, index) => (
                <SelectItem value={label} key={index}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="pt-2">
          <Button variant="destructive" className="w-full" onClick={handlePlayAlgorithm}>
            <Play />
            <span>Chạy thuật toán</span>
          </Button>
        </div>
      </div>
    </>
  )
}
export default AttributesGraph