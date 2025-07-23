import { create } from "zustand"

type State = {
  selectedElements: string[],
  startNode: string,
}

type Action = {
  handleResetSelectedElement: () => void,
  handleAddSelectedElements: (elementId: string) => void
  handleRemoveSelectedElements: (elementId: string) => void
  handleSetStartNode: (newStartNode: string) => void
}

export const useGraphStore = create<State & Action>((set) => ({
  selectedElements: [],
  startNode: "",

  handleSetStartNode: (newStartNode: string) => {
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