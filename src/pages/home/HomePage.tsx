/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Core, EdgeSingular, NodeSingular } from "cytoscape";
import { useEffect, useRef, useState } from "react";
import type { Algorithm } from "../../types/graph.type";
import cytoscape from "cytoscape";

const HomePage = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeSingular | null>(null);
  const [nodeCounter, setNodeCounter] = useState(0);
  const [edgeCounter, setEdgeCounter] = useState(0);
  const [stepInfo, setStepInfo] = useState('Click vào không gian trống để thêm đỉnh. Click vào 2 đỉnh để tạo cạnh.');
  const [vertexDegrees, setVertexDegrees] = useState<string>('Chưa có đỉnh');
  const [algorithm, setAlgorithm] = useState<Algorithm>({
    running: false,
    stack: [],
    circuit: [],
    currentVertex: null,
    visitedEdges: new Set(),
    adjacencyList: {},
    step: 0,
    finished: false
  });
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState('');

  const selectNode = useRef<NodeSingular | null>(null);

  const isDraggingRef = useRef(false)
  const dragStartNodeRef = useRef<NodeSingular | null>(null)
  const dragTargetNodeRef = useRef<NodeSingular | null>(null)


  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,

      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#0074D9',
            'label': 'data(id)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '16px',
            'font-weight': 'bold',
            'width': 40,
            'height': 40,
            'border-width': 2,
            'border-color': '#333'
          }
        },
        {
          selector: 'node.selected',
          style: {
            'background-color': '#FFDC00',
            'border-color': '#FF851B'
          }
        },
        {
          selector: 'node.current',
          style: {
            'background-color': '#2ECC40',
            'border-color': '#01FF70'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#666',
            'target-arrow-color': '#666',
            "target-arrow-shape": "none",
            'curve-style': 'straight',
            'label': 'data(order)',
            'font-size': '12px',
            'color': '#333',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-shape': 'roundrectangle',
            'text-background-padding': '3px'
          }
        },
        {
          selector: 'edge.visited',
          style: {
            'line-color': '#FF4136',
            'width': 4
          }
        },
        {
          selector: 'edge.current',
          style: {
            'line-color': '#FF851B',
            'width': 5
          }
        },
        {
          selector: "node.dragging",
          style: {
            "background-color": "#FF851B",
            "border-color": "#FF4136",
            "border-width": 3,
            "z-index": 999,
          },
        },
      ],

      layout: {
        name: 'preset'
      },

      userZoomingEnabled: true,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      selectionType: 'single'
    });

    cyInstance.current = cy;

    // Event listeners
    cy.on('dblclick', (evt) => {
      if (algorithm.running) return;
      if (evt.target === cy) {
        // Click vào không gian trống - thêm node
        addNode(evt.position);
      } else if (evt.target.isNode()) {
        // Click vào node
        handleNodeClick(evt.target);
      }
    });

    cy.on("mousedown", (evt) => {
      if (algorithm.running) return
      if (evt.originalEvent.shiftKey && evt.target.isNode()) {
        // Ngăn không cho node bị kéo di chuyển
        evt.preventDefault()
        evt.stopPropagation()

        isDraggingRef.current = true
        dragStartNodeRef.current = evt.target
        evt.target.addClass("dragging")

        // Vô hiệu hóa dragging của node và panning
        cy.autoungrabify(true) // Ngăn tất cả nodes bị grab
        cy.userPanningEnabled(false)

        // Thêm thông báo
        setStepInfo(`Đang kéo từ đỉnh ${evt.target.id()}. Kéo đến đỉnh khác để tạo cạnh.`)
      }
    })

    // cy.on("mousemove", (evt) => {
    //   if (isDraggingRef.current && dragStartNodeRef.current) {
    //     // Xóa temporary edge và node tạm nếu có
    //     cy.elements('[id="temp-edge"]').remove()
    //     cy.elements('[id="temp-target"]').remove()

    //     // Tọa độ bắt đầu và chuột hiện tại
    //     const startPos = dragStartNodeRef.current.position()
    //     const mousePos = evt.position || (evt as any).cyPosition

    //     // Thêm temporary node tại vị trí chuột (invisible)
    //     cy.add({
    //       group: "nodes",
    //       data: { id: "temp-target" },
    //       position: mousePos,
    //       style: {
    //         opacity: 0,
    //         width: 1,
    //         height: 1,
    //       },
    //     })

    //     // Thêm temporary edge
    //     cy.add({
    //       group: "edges",
    //       data: {
    //         id: "temp-edge",
    //         source: dragStartNodeRef.current.id(),
    //         target: "temp-target",
    //       },
    //       style: {
    //         "line-color": "#FF851B",
    //         "target-arrow-color": "#FF851B",
    //         "target-arrow-shape": "none",
    //         width: 2,
    //         opacity: 0.7,
    //         "line-style": "dashed",
    //       },
    //     })
    //   }
    // })

    // cy.on("mouseup", (evt) => {
    //   if (isDraggingRef.current && dragStartNodeRef.current) {
    //     // 1️⃣ If the drop target is a *real* node (≠ start node & ≠ temp node) create the edge
    //     if (evt.target.isNode() && evt.target !== dragStartNodeRef.current && evt.target.id() !== "temp-target") {
    //       addEdge(dragStartNodeRef.current, evt.target as NodeSingular)
    //     }

    //     // 2️⃣ Always clean up temporary graphics
    //     cy.elements('[id="temp-edge"]').remove()
    //     cy.elements('[id="temp-target"]').remove()

    //     // 3️⃣ Reset drag state
    //     dragStartNodeRef.current.removeClass("dragging")
    //     isDraggingRef.current = false
    //     dragStartNodeRef.current = null

    //     // Bật lại khả năng kéo nodes và panning
    //     cy.autoungrabify(false) // Cho phép grab nodes trở lại
    //     cy.userPanningEnabled(false)
    //   }
    // })


    // Cleanup


    cy.on("mousemove", (evt) => {
      if (isDraggingRef.current && dragStartNodeRef.current) {
        // Xóa temporary elements
        cy.elements('[id="temp-edge"]').remove()
        cy.elements('[id="temp-target"]').remove()

        // Xóa highlight từ node đích trước đó
        cy.nodes().removeClass("drag-target")

        const mousePos = evt.position || (evt as any).cyPosition

        // Tìm node gần nhất tại vị trí chuột
        const nodeAtPosition = cy.nodes().filter((node) => {
          if (node.id() === dragStartNodeRef.current?.id()) return false
          const nodePos = node.position()
          const distance = Math.sqrt(Math.pow(mousePos.x - nodePos.x, 2) + Math.pow(mousePos.y - nodePos.y, 2))
          return distance < 25 // Khoảng cách threshold
        })

        if (nodeAtPosition.length > 0) {
          // Có node gần đó - highlight nó
          const targetNode = nodeAtPosition[0]
          targetNode.addClass("drag-target")
          dragTargetNodeRef.current = targetNode

          // Tạo temporary edge đến node đích thực
          cy.add({
            group: "edges",
            data: {
              id: "temp-edge",
              source: dragStartNodeRef.current.id(),
              target: targetNode.id(),
            },
            style: {
              "line-color": "#2ECC40",
              "target-arrow-color": "#2ECC40",
              "target-arrow-shape": "none",
              width: 3,
              opacity: 0.8,
              "line-style": "dashed",
            },
          })
        } else {
          // Không có node gần đó - tạo temporary target
          dragTargetNodeRef.current = null

          cy.add({
            group: "nodes",
            data: { id: "temp-target" },
            position: mousePos,
            style: {
              opacity: 0,
              width: 1,
              height: 1,
            },
          })

          cy.add({
            group: "edges",
            data: {
              id: "temp-edge",
              source: dragStartNodeRef.current.id(),
              target: "temp-target",
            },
            style: {
              "line-color": "#FF851B",
              "target-arrow-color": "#FF851B",
              "target-arrow-shape": "triangle",
              width: 2,
              opacity: 0.7,
              "line-style": "dashed",
            },
          })
        }
      }
    })

    cy.on("mouseup", (evt) => {
      if (isDraggingRef.current && dragStartNodeRef.current) {
        // Sử dụng dragTargetNodeRef thay vì evt.target
        if (dragTargetNodeRef.current && dragTargetNodeRef.current !== dragStartNodeRef.current) {
          addEdge(dragStartNodeRef.current, dragTargetNodeRef.current)
        }

        // Cleanup
        cy.elements('[id="temp-edge"]').remove()
        cy.elements('[id="temp-target"]').remove()
        cy.nodes().removeClass("drag-target")

        dragStartNodeRef.current.removeClass("dragging")
        isDraggingRef.current = false
        dragStartNodeRef.current = null
        dragTargetNodeRef.current = null

        cy.autoungrabify(false)
        cy.userPanningEnabled(false)
      }
    })

    return () => {
      cy.destroy();
    };
  }, []);

  const addNode = (position: { x: number, y: number }) => {
    if (!cyInstance.current) return;

    const currentIndex = cyInstance.current.nodes().length;
    const nodeId = String.fromCharCode(65 + currentIndex);
    setNodeCounter(currentIndex + 1);

    cyInstance.current.add({
      group: "nodes",
      data: { id: nodeId },
      position: position,
    });

    setSelectedNode(null);
    cyInstance.current.nodes().removeClass('selected');

    setStepInfo(`Đã thêm đỉnh ${nodeId}.`);
    updateVertexDegrees();

  }

  const handleNodeClick = (node: NodeSingular) => {
    if (!cyInstance.current) return;

    const selectedNode = selectNode.current;

    if (selectedNode === null) {
      setSelectedNode(node);
      selectNode.current = node;
      cyInstance.current.nodes().removeClass('selected');
      node.addClass('selected')
      setStepInfo(`Đã chọn đỉnh ${node.id()}. Click vào đỉnh khác để tạo cung.`);
    } else if (selectedNode.id() !== node.id()) {
      addEdge(selectedNode, node);
      setSelectedNode(null);
      selectNode.current = null;
      cyInstance.current.nodes().removeClass('selected');
      setStepInfo('Đã thêm cạnh. Click vào không gian trống để thêm đỉnh hoặc Click vào 2 đỉnh để thêm cạnh.');
    } else {
      setSelectedNode(null);
      selectNode.current = null;
      cyInstance.current.nodes().removeClass('selected');
      setStepInfo('Đã bỏ chọn đỉnh. Click vào không gian trống để thêm đỉnh hoặc click vào 2 đỉnh để thêm cạnh.');
    }
  }

  const addEdge = (node1: NodeSingular, node2: NodeSingular) => {
    if (!cyInstance.current) return;

    const edgeId = `${node1.id()}-${node2.id()}`;
    const reverseEdgeId = `${node2.id()}-${node1.id()}`;
    console.log("Check: ", edgeId, ' - ', reverseEdgeId);
    if (cyInstance.current.getElementById(edgeId).length === 0 &&
      cyInstance.current.getElementById(reverseEdgeId).length === 0) {
      cyInstance.current.add({
        group: 'edges',
        data: {
          id: edgeId,
          source: node1.id(),
          target: node2.id(),
          order: '',
        }
      });
      setEdgeCounter(prev => prev + 1);
      updateVertexDegrees();
    }
  }

  const updateVertexDegrees = () => {
    if (!cyInstance.current) return;

    const nodes = cyInstance.current.nodes();
    const degreesText = nodes.map(node => `${node.id()}: ${node.degree()}`).join(', ');
    setVertexDegrees(degreesText || "Chưa có đỉnh");
  }

  const clearGraph = () => {
    if (!cyInstance.current) return;

    cyInstance.current.elements().remove();
    setNodeCounter(0);
    setEdgeCounter(0);
    setSelectedNode(null);
    resetAlgorithm();
    setStepInfo('Đồ thị đã được xóa. Click vào không gian trống để thêm đỉnh.');
    setVertexDegrees('Chưa có đỉnh');
  }

  const addSampleGraph = () => {
    if (!cyInstance.current) return;

    clearGraph();
    const nodes = [
      { id: 'A', x: 150, y: 100 },
      { id: 'B', x: 350, y: 100 },
      { id: 'C', x: 450, y: 200 },
      { id: 'D', x: 350, y: 300 },
      { id: 'E', x: 150, y: 300 },
      { id: 'F', x: 50, y: 200 }
    ];

    const edges = [
      ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'],
      ['E', 'F'], ['F', 'A'], ['A', 'D'], ['B', 'E']
    ]

    nodes.forEach(node => {
      cyInstance.current?.add({
        group: 'nodes',
        data: { id: node.id },
        position: { x: node.x, y: node.y }
      });
    });

    edges.forEach(([source, target]) => {
      cyInstance.current?.add({
        group: 'edges',
        data: {
          id: `${source}-${target}`,
          source: source,
          target: target,
          order: '',
        }
      });
    });

    setNodeCounter(6);
    setEdgeCounter(8);
    updateVertexDegrees();
    setStepInfo('Đã tạo đồ thị mẫu. Kiểm tra điều kiện Euler trước khi chạy thuật toán.');
  }

  const resetAlgorithm = () => {
    if (!cyInstance.current) return;

    setAlgorithm({
      running: false,
      finished: false,
      stack: [],
      circuit: [],
      currentVertex: null,
      visitedEdges: new Set(),
      adjacencyList: {},
      step: 0
    });

    // Reset visual state
    cyInstance.current.elements().removeClass('visited current selected');
    cyInstance.current.edges().forEach(edge => {
      edge.data('order', '');
    });

    setStepInfo('Click vào không gian trống để thêm đỉnh. Click vào 2 đỉnh để tạo cạnh.');
    setShowResult(false);
  };

  // Algorithm
  const checkConditionEuler = (): boolean => {
    if (!cyInstance.current) return false;

    const nodes = cyInstance.current.nodes();
    if (nodes.length === 0) {
      setStepInfo('Đồ thị trống');
      return false;
    }

    const degrees: { [key: string]: number } = {};
    nodes.forEach(node => {
      degrees[node.id()] = node.degree();
    });

    const odDegreeVertices = Object.entries(degrees).filter(([vertexDegrees, degree]) => degree % 2 === 1);

    if (odDegreeVertices.length === 0) {
      setStepInfo('Đồ thị có chu trình Euler');
      return true;
    } else {
      setStepInfo('Đồ thị không có chu trình Euler');
      return false;
    }
  }

  const startAlgorithm = () => {
    if (!cyInstance.current || !checkConditionEuler()) return;

    const nodes = cyInstance.current.nodes();
    const edges = cyInstance.current.edges();

    const adjacencyList: { [key: string]: EdgeSingular[] } = {};
    nodes.forEach(node => {
      adjacencyList[node.id()] = [];
    });

    edges.forEach(edge => {
      const source = edge.source().id();
      const target = edge.target().id();
      adjacencyList[source].push(edge);
      adjacencyList[target].push(edge);
    });

    const startVertex = nodes[0].id();

    setAlgorithm({
      running: true,
      finished: false,
      stack: [startVertex],
      circuit: [],
      currentVertex: startVertex,
      visitedEdges: new Set(),
      adjacencyList,
      step: 0,
    });

    cyInstance.current.elements().removeClass('visited current selected');
    edges.forEach(edge => {
      edge.data('order', '');
    });

    cyInstance.current.getElementById(startVertex).addClass('current');
    setStepInfo(`Thuật toán Hierholzer bắt đầu. Đặt ${startVertex} vào stack.`);
    setShowResult(false);
  }

  const nextStep = () => {
    if (!cyInstance.current || !algorithm.running || algorithm.finished) return;


    if (algorithm.stack.length === 0) {
      setAlgorithm(prev => ({ ...prev, finished: true, running: true }));
      showFinalResult();
      return;
    }

    const currentVertexId = algorithm.stack[algorithm.stack.length - 1];

    cyInstance.current.nodes().removeClass('current');
    cyInstance.current.getElementById(currentVertexId).addClass('current');

    const availableEdges = algorithm.adjacencyList[currentVertexId].filter(edge => !algorithm.visitedEdges.has(edge.id()));

    const newStack = [...algorithm.stack];
    const newCircuit = [...algorithm.circuit];
    const newVisitedEdges = new Set(algorithm.visitedEdges)

    const newStep = algorithm.step + 1;

    if (availableEdges.length > 0) {
      const selectedEdge = availableEdges[0];
      const source = selectedEdge.source().id();
      const target = selectedEdge.target().id();

      const nextVertexId = source === currentVertexId ? target : source;

      newVisitedEdges.add(selectedEdge.id());
      selectedEdge.addClass('visited');
      selectedEdge.data('order', newStep.toString());

      cyInstance.current.edges().removeClass('current');
      selectedEdge.addClass('current');

      newStack.push(nextVertexId);
      setStepInfo(`Bước ${newStep}: Từ ${currentVertexId}, đi qua cạnh ${selectedEdge.id()}, đến ${nextVertexId}. Thêm ${nextVertexId} vào stack`);
    } else {
      const poppedVertex = newStack.pop();
      if (poppedVertex) {
        newCircuit.push(poppedVertex);
      }

      cyInstance.current.edges().removeClass('current');
      setStepInfo(`Bước ${newStep}: Không còn cung đi từ ${currentVertexId}. Lấy ${currentVertexId} khỏi stack và thêm vào circuit.`);
    }

    setAlgorithm(prev => ({
      ...prev,
      stack: newStack,
      circuit: newCircuit,
      visitedEdges: newVisitedEdges,
      step: newStep,
      currentVertex: currentVertexId
    }))

  }

  const validateEuler = (): boolean => {
    const circuit = algorithm.circuit.reverse();

    // console.log("Ciruit: ", circuit);
    for (let i = 0; i < circuit.length - 1; i++) {
      const u = circuit[i];
      const v = circuit[i + 1];

      const edge1 = `${u}-${v}`;
      // const edge2 = `${v}-${u}`;
      // console.log("Check edge: ", edge1);

      if (!cyInstance.current?.getElementById(edge1).nonempty()
        // || !cyInstance.current?.getElementById(edge2).nonempty()
      ) {
        return false;
      }
    }
    return true;
  }



  const showFinalResult = () => {
    if (!cyInstance.current) return;

    // const cleanAdjList = Object.fromEntries(
    //   Object.entries(algorithm.adjacencyList).map(([node, edges]) => {
    //     return [
    //       node,
    //       edges.map(edge => edge.data()) // lấy dữ liệu đơn giản (không circular)
    //     ];
    //   })
    // );

    // console.log(JSON.stringify(cleanAdjList, null, 2));

    if (validateEuler()) {
      const reversedCircuit = algorithm.circuit.slice().reverse();
      setResultText(`Chu trình Euler: ${reversedCircuit.join(' -> ')}`);
    } else {
      setResultText("Lỗi không tìm thấy chu trình Euler");
    }

    setShowResult(true);

    cyInstance.current.edges().removeClass('current');
    cyInstance.current.nodes().removeClass('current');
  }

  return (
    <div className="container mx-auto p-5 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-5 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Thuật toán tìm chu trình Euler (Hierholzer) - React TypeScript</h1>

        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 mb-4">
          <strong>Hướng dẫn:</strong> Click vào không gian trống để thêm đỉnh. Click vào 2 đỉnh để tạo cạnh. Kéo thả để di chuyển đỉnh.
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={clearGraph}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Xóa đồ thị
          </button>
          <button
            onClick={addSampleGraph}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Đồ thị mẫu
          </button>
          <button
            onClick={checkConditionEuler}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Kiểm tra điều kiện
          </button>
          <button
            onClick={startAlgorithm}
            disabled={algorithm.running}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Bắt đầu thuật toán
          </button>
          <button
            onClick={nextStep}
            disabled={!algorithm.running || algorithm.finished}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400"
          >
            Bước tiếp theo
          </button>
          <button
            onClick={resetAlgorithm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-5">
          <div className="flex-[2]">
            <div className="h-96 border-2 border-gray-300 rounded bg-gray-50">
              <div ref={cyRef} className="w-full h-full rounded" />
            </div>
          </div>

          <div className="flex-1 bg-white p-4 rounded border border-gray-300 max-h-96 overflow-y-auto">
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <h3 className="font-bold mb-2">Bước hiện tại</h3>
              <div className="text-sm">{stepInfo}</div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <h3 className="font-bold mb-2">Cấu trúc dữ liệu</h3>
              <div className="text-sm space-y-1">
                <div><strong>Stack:</strong> [{algorithm.stack.join(', ')}]</div>
                <div><strong>Circuit:</strong> [{algorithm.circuit.join(', ')}]</div>
                <div><strong>Đỉnh hiện tại:</strong> {algorithm.currentVertex || '-'}</div>
                <div><strong>Bước:</strong> {algorithm.step}</div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">Bậc của các đỉnh</h3>
              <div className="text-sm">{vertexDegrees}</div>
            </div>

            {showResult && (
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <h3 className="font-bold mb-2">Kết quả</h3>
                <div className="text-sm">{resultText}</div>
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Chú thích</h3>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Đỉnh bình thường</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Đỉnh hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Đỉnh được chọn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span>Cạnh chưa đi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Cạnh đã đi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HomePage