/* eslint-disable react-hooks/exhaustive-deps */
import { List, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { useGraphStatusStore } from "../../../store/useGraphStatusStore"
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ALGORITHM_SELECT, RUN_MODE } from "../../../utils/constant";
import { Button } from "../../../components/ui/button";
import { useGraphStore } from "../../../store/useGraphStore";
import { useEffect } from "react";

interface AttributesGraphType {
  handleChangeStart: (value: string) => void,
  handlePlayAlgorithm: (stepByStep: boolean) => void,
}

const AttributesGraph = ({ handleChangeStart, handlePlayAlgorithm }: AttributesGraphType) => {
  const { nodeCounter, edgeCounter, nodeLabels, interconnects } = useGraphStatusStore();
  const { selectAlgorithm, runMode, startNode, suggestMess, updateOddNode, updateSuggestMess, updateRunMode, updateSelectedAlgorithm } = useGraphStore();


  useEffect(() => {
    // Reset status find Euler
    updateOddNode([]);
    updateSuggestMess("");
    // Check even node degree
  }, [nodeLabels]);

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
          <Select value={selectAlgorithm} onValueChange={(value) => { updateSelectedAlgorithm(value) }}>
            <SelectTrigger className="w-full" id="select-algorithm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent defaultValue={ALGORITHM_SELECT.HIERHOLZER}>
              <SelectItem value={ALGORITHM_SELECT.HIERHOLZER}>Hierholzer</SelectItem>
              <SelectItem value={ALGORITHM_SELECT.FLEURY}>Fleury</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="select-runMode">Chế độ chạy</Label>
          <Select value={runMode} onValueChange={(value) => { updateRunMode(value) }}>
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
          <span className="text-xs text-red-600/80">{suggestMess}</span>
        </div>
        <div className="pt-2">
          <Button variant="destructive" className="w-full" onClick={() => handlePlayAlgorithm(runMode === RUN_MODE.STEP)}>
            <Play />
            <span>Chạy thuật toán</span>
          </Button>
        </div>
      </div>
    </>
  )
}
export default AttributesGraph