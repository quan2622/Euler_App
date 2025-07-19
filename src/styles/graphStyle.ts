import type { StylesheetCSS } from "cytoscape";

export const getCytoscapeStyle = (isDirected: boolean): StylesheetCSS[] => [
  {
    selector: "node",
    css: {
      "background-color": "#3B82F6", // Màu nền xanh
      label: "data(label)", // Hiển thị label từ data
      color: "#FFFFFF", // Màu chữ trắng
      "text-valign": "center", // Căn giữa theo chiều dọc
      "text-halign": "center", // Căn giữa theo chiều ngang
      "font-size": 12,
      "font-weight": "bold",
      width: 40,
      height: 40,
      "border-width": 2,
      "border-color": "#1E40AF",
      "text-outline-width": 1,
      "text-outline-color": "#1E40AF",
      shape: "ellipse", // Hình tròn
    },
  },

  // Style cho edges
  {
    selector: "edge",
    css: {
      "line-color": "#6B7280",
      "target-arrow-color": "#6B7280",
      // Hiển thị mũi tên nếu là directed graph
      "target-arrow-shape": isDirected ? "triangle" : "none",
      "curve-style": "bezier", // Đường cong
      width: 2,
    },
  },

  // Style cho elements được chọn
  {
    selector: "node.selected",
    css: {
      // "background-color": "#EF4444", // Màu đỏ khi được chọn
      // "line-color": "#EF4444",
      // "target-arrow-color": "#EF4444",
      // "border-color": "#FCD34D", // Viền vàng
      "border-width": 3,
      "background-color": "#FFDC00",
      "border-color": "#FF851B",
    },
  },

  // Style cho nodes được highlight khi hover
  {
    selector: ".highlighted",
    css: {
      "background-color": "#10B981", // Màu xanh lá
      "border-color": "#059669",
      "border-width": "3px",
    },
  },

  // Style cho node tạm thời khi đang kéo
  {
    selector: ".temp-node",
    css: {
      "background-color": "transparent",
      "border-width": 0,
      opacity: 0,
      width: 1,
      height: 1,
      label: "",
      events: "no", // Không nhận events
    },
  },

  // Style cho edge tạm thời khi đang kéo
  {
    selector: ".temp-edge",
    css: {
      "line-color": "#F59E0B", // Màu cam
      "line-style": "dashed", // Đường đứt nét
      "target-arrow-color": "#F59E0B",
      "target-arrow-shape": isDirected ? "triangle" : "none",
      width: 3,
      opacity: 0.7,
      events: "no",
    },
  },

  // Style cho Euler path
  {
    selector: ".euler-path",
    css: {
      "line-color": "#DC2626", // Màu đỏ
      "target-arrow-color": "#DC2626",
      width: 4,
      "z-index": 10,
    },
  },

  // Style cho node hiện tại trong Euler path
  {
    selector: ".euler-current",
    css: {
      "background-color": "#DC2626", // Màu đỏ
      "border-color": "#FEF3C7",
      "border-width": 4,
      "z-index": 10,
    },
  },
];