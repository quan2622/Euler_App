import type { StylesheetCSS } from "cytoscape";

export const getCytoscapeStyle = (isDirected: boolean): StylesheetCSS[] => [
  // NODE STYLE
  {
    selector: "node",
    css: {
      "background-color": "#3B82F6",
      label: "data(label)",
      color: "#FFFFFF",
      "text-valign": "center",
      "text-halign": "center",
      "font-size": 12,
      "font-weight": "bold",
      width: 40,
      height: 40,
      "border-width": 2,
      "border-color": "#1E40AF",
      "text-outline-width": 1,
      "text-outline-color": "#1E40AF",
      shape: "ellipse",
    },
  },

  // EDGES STYLE
  {
    selector: "edge",
    css: {
      "line-color": "#6B7280",
      "target-arrow-color": "#6B7280",
      "target-arrow-shape": isDirected ? "triangle" : "none",
      "curve-style": "bezier", // Đường cong
      width: 2,
    },
  },
  // SELECTED ELEMENT STYLE
  {
    selector: "node.hasSelected",
    css: {
      "border-color": "#EF4444",
      "border-width": 3,
    },
  },
  {
    selector: "edge.hasSelected",
    css: {
      "line-color": "#EF4444",
      "target-arrow-color": "#EF4444",
      width: 3,
    },
  },
  // SELECTED ELEMENT STYLE

  // EULER PATH STYLE
  {
    selector: "edge.euler-path",
    css: {
      "line-color": "#DC2626",
      "target-arrow-color": "#DC2626",
      width: 3,
      "z-index": 10,
    },
  },

  // ALGORITHM PATH STYLE
  {
    selector: "edge.AL-path",
    css: {
      "line-color": "#00bba7",
      "target-arrow-color": "#00bba7",
      width: 2,
    },
  },

  // START NODE STYLE
  {
    selector: "node.start",
    css: {
      "border-width": 3,
      "background-color": "#FFDC00",
      "border-color": "#FF851B",
    },
  },

  // END NODE STYLE
  {
    selector: "node.end",
    css: {
      "border-width": 3,
      "border-color": "#e7000b",
    },
  },

  // NODE TEMP STYLE WHILE CREATE NEW EDGE
  {
    selector: ".temp-node",
    css: {
      "background-color": "transparent",
      "border-width": 0,
      opacity: 0,
      width: 1,
      height: 1,
      label: "",
      events: "no",
    },
  },

  // EDGE TEMP STYLE WHILE CREATE NEW EDGE
  {
    selector: ".temp-edge",
    css: {
      "line-color": "#F59E0B",
      "line-style": "dashed",
      "target-arrow-color": "#F59E0B",
      "target-arrow-shape": isDirected ? "triangle" : "none",
      width: 3,
      opacity: 0.7,
      events: "no",
    },
  },

  // EDGE TARGET STYLE WHILE CREATE NEW EDGE
  {
    selector: ".temp-edge-target",
    css: {
      "line-color": "#2ECC40",
      "target-arrow-color": "#2ECC40",
      "target-arrow-shape": isDirected ? "triangle" : "none",
      "line-style": "solid",
      width: 3,
      opacity: 0.7,
      events: "no",
    },
  },
];