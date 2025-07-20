import { create } from "zustand"

type State = {
  selectedElements: string[]
}

type Action = {
  handleAddSelectedElements: (elementId: string) => void
  handleRemoveSelectedElements: (elementId: string) => void
}

export const useGraphStore = create<State & Action>((set) => ({
  selectedElements: [],

  handleAddSelectedElements: (elementId) => {
    set(prev => ({ selectedElements: [...prev.selectedElements.filter(id => id !== elementId), elementId] }))
  },
  handleRemoveSelectedElements: (elementId) => {
    set(prev => ({ selectedElements: [...prev.selectedElements.filter(id => id !== elementId)] }))
  }
}))