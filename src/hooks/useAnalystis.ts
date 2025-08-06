import { useCallback, useEffect } from "react";
import { useGraphStatusStore } from "../store/useGraphStatusStore";
import type { Core, EdgeSingular, NodeSingular } from "cytoscape";

export const useAnalystis = (
  cyInstanceRef: React.RefObject<Core | null>,
  isDirectedGraph: boolean,

) => {
  const { updateInterConnect, updateAnalysis } = useGraphStatusStore();

  const analyzeGraph = useCallback(() => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    const nodes = cy.nodes();
    const edges = cy.edges();

    const nodeIds = nodes.map(node => node.id());
    const nodeLabels = nodes.map(node => node.data("label"));
    const nodeIndexMap: { [key: string]: number } = {};

    // Ma trận kề
    nodeIds.forEach((id, index) => nodeIndexMap[id] = index);
    const n = nodeIds.length;

    const adjacencyMatix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    edges.forEach((edge: EdgeSingular) => {
      const sourceId = edge.source().id();
      const targetId = edge.target().id();
      const sourceIndex = nodeIndexMap[sourceId];
      const targetIndex = nodeIndexMap[targetId];

      if (sourceIndex !== undefined && targetIndex !== undefined) {
        adjacencyMatix[sourceIndex][targetIndex] += 1;
        if (!isDirectedGraph)
          adjacencyMatix[targetIndex][sourceIndex] += 1;
      }
    });

    // Danh sách kề
    const adjacencyList: { [key: string]: string[] } = {};
    nodeIds.map((nodeId) => adjacencyList[nodeId] = []);

    edges.forEach((edge: EdgeSingular) => {
      const sourceId = edge.source().id();
      const targetId = edge.target().id();

      adjacencyList[sourceId].push(targetId);
      if (!isDirectedGraph) {
        if (!adjacencyList[targetId]) {
          adjacencyList[targetId] = [];
        }
        adjacencyList[targetId].push(sourceId);
      }
    })

    // Sắp xếp các mảng trong danh sách kề
    for (const [key, value] of Object.entries(adjacencyList)) {
      adjacencyList[key] = value.sort((a, b) => a.localeCompare(b));
    }

    const nodeCounter = nodeLabels.length + 1;

    updateAnalysis(adjacencyMatix, adjacencyList, nodeLabels, nodeCounter);
  }, [isDirectedGraph, updateAnalysis]);

  const findInterConnection = useCallback(() => {
    if (!cyInstanceRef.current) return;
    const cy = cyInstanceRef.current;
    const nodes = cy.nodes();
    const visited = new Set<string>();
    const interconnects: string[][] = [];


    const dfs = (nodeId: string, interconnect: string[]) => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      const node = cy.$id(nodeId);
      interconnect.push(node.data("label"));

      const neightbors = node.neighborhood("node");
      neightbors.forEach((neightbor: NodeSingular) => {
        const neightborId = neightbor.id();
        if (!visited.has(neightborId)) {
          dfs(neightborId, interconnect);
        }
      })
    }

    nodes.forEach((node: NodeSingular) => {
      const nodeId = node.id();
      if (!visited.has(nodeId)) {
        const interconnect: string[] = [];
        dfs(nodeId, interconnect);
        if (interconnect.length > 0) {
          interconnects.push(interconnect.sort());
        }
      }
    })

    return interconnects;
  }, []);

  const handleUpdateInterConnect = useCallback(() => {
    const interconnects = findInterConnection();
    if (interconnects)
      updateInterConnect(interconnects);
  }, [findInterConnection]);

  useEffect(() => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    handleUpdateInterConnect();
    analyzeGraph();

    const updateAnalystis = () => {
      handleUpdateInterConnect();
      analyzeGraph();
    }

    cy.on("add remove", updateAnalystis);
    return () => {
      cy.off("add remove", updateAnalystis);
    }
  }, [handleUpdateInterConnect, isDirectedGraph]);

}