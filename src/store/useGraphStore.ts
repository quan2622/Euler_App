import { create } from "zustand"
import { ALGORITHM_SELECT, RUN_MODE } from "../utils/constant"

type State = {
  selectedElements: string[],
  startNode: string,
  oddNodes: string[],
  suggestMess: string,
  runMode: string,
  selectAlgorithm: string,
}

type Action = {
  handleResetSelectedElement: () => void,
  handleAddSelectedElements: (elementId: string) => void
  handleRemoveSelectedElements: (elementId: string) => void
  handleSetStartNode: (newStartNode: string) => void
  updateOddNode: (newOddNodes: string[]) => void
  updateSuggestMess: (newMess: string) => void,
  updateRunMode: (newRunMode: string) => void,
  updateSelectedAlgorithm: (newAlgorithm: string) => void,
}

export const useGraphStore = create<State & Action>((set) => ({
  selectedElements: [],
  startNode: "",
  oddNodes: [],
  suggestMess: "",
  runMode: RUN_MODE.AUTO,
  selectAlgorithm: ALGORITHM_SELECT.HIERHOLZER,

  updateSelectedAlgorithm: (newAlgorithm) => {
    set({ selectAlgorithm: newAlgorithm });
  },
  updateRunMode: (newRunMode) => {
    set({ runMode: newRunMode })
  },
  updateSuggestMess: (newMess) => {
    set({ suggestMess: newMess });
  },
  updateOddNode: (newOddNodes) => {
    set({ oddNodes: newOddNodes })
  },
  handleSetStartNode: (newStartNode) => {
    set({ startNode: newStartNode }) //node label
  },
  handleResetSelectedElement: () => {
    set({ selectedElements: [] });
  },
  handleAddSelectedElements: (elementId) => {
    set(prev => ({ selectedElements: [...prev.selectedElements.filter(id => id !== elementId), elementId] }))
  },
  handleRemoveSelectedElements: (elementId) => {
    set(prev => ({ selectedElements: [...prev.selectedElements.filter(id => id !== elementId)] }))
  }
}))