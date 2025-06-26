import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { MaterialHistory } from "@/types/material"

// Collection reference
const materialHistoryCollection = collection(db, "materialHistory")

// Get all material history
export const getMaterialHistory = async (): Promise<MaterialHistory[]> => {
  try {
    const snapshot = await getDocs(materialHistoryCollection)
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as MaterialHistory,
    )
  } catch (error) {
    console.error("Error getting material history:", error)
    throw error
  }
}

// Add material history entry
export const addMaterialHistory = async (history: Omit<MaterialHistory, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(materialHistoryCollection, history)
    return docRef.id
  } catch (error) {
    console.error("Error adding material history:", error)
    throw error
  }
}
