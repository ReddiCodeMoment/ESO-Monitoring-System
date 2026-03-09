import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase.config' // Make sure this exists
import { ExtensionProgram, Activity } from '../types'

// ===== EXTENSION PROGRAMS =====

export const createExtensionProgram = async (
  programData: Omit<ExtensionProgram, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'extensionPrograms'), {
      ...programData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      archived: false,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating program:', error)
    throw error
  }
}

export const getExtensionPrograms = async (): Promise<ExtensionProgram[]> => {
  try {
    const q = query(
      collection(db, 'extensionPrograms'),
      where('archived', '==', false)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || '',
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || '',
    })) as ExtensionProgram[]
  } catch (error) {
    console.error('Error fetching programs:', error)
    throw error
  }
}

export const getExtensionProgramById = async (
  programId: string
): Promise<ExtensionProgram | null> => {
  try {
    const docRef = doc(db, 'extensionPrograms', programId)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate().toISOString() || '',
        updatedAt: docSnapshot.data().updatedAt?.toDate().toISOString() || '',
      } as ExtensionProgram
    }
    return null
  } catch (error) {
    console.error('Error fetching program:', error)
    throw error
  }
}

export const updateExtensionProgram = async (
  programId: string,
  programData: Partial<Omit<ExtensionProgram, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'extensionPrograms', programId)
    await updateDoc(docRef, {
      ...programData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating program:', error)
    throw error
  }
}

export const deleteExtensionProgram = async (programId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'extensionPrograms', programId)
    await updateDoc(docRef, { archived: true, updatedAt: Timestamp.now() })
  } catch (error) {
    console.error('Error deleting program:', error)
    throw error
  }
}

// ===== ACTIVITIES =====

export const createActivity = async (
  programId: string,
  activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(
      collection(db, 'extensionPrograms', programId, 'activities'),
      {
        ...activityData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    )
    return docRef.id
  } catch (error) {
    console.error('Error creating activity:', error)
    throw error
  }
}

export const getActivities = async (programId: string): Promise<Activity[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'extensionPrograms', programId, 'activities')
    )
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || '',
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || '',
    })) as Activity[]
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw error
  }
}

export const getActivityById = async (
  programId: string,
  activityId: string
): Promise<Activity | null> => {
  try {
    const docRef = doc(
      db,
      'extensionPrograms',
      programId,
      'activities',
      activityId
    )
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate().toISOString() || '',
        updatedAt: docSnapshot.data().updatedAt?.toDate().toISOString() || '',
      } as Activity
    }
    return null
  } catch (error) {
    console.error('Error fetching activity:', error)
    throw error
  }
}

export const updateActivity = async (
  programId: string,
  activityId: string,
  activityData: Partial<Omit<Activity, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(
      db,
      'extensionPrograms',
      programId,
      'activities',
      activityId
    )
    await updateDoc(docRef, {
      ...activityData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating activity:', error)
    throw error
  }
}

export const deleteActivity = async (
  programId: string,
  activityId: string
): Promise<void> => {
  try {
    const docRef = doc(
      db,
      'extensionPrograms',
      programId,
      'activities',
      activityId
    )
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting activity:', error)
    throw error
  }
}

// ===== BATCH OPERATIONS =====

export const createBulkActivities = async (
  programId: string,
  activities: Array<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const activitiesRef = collection(db, 'extensionPrograms', programId, 'activities')

    activities.forEach((activity) => {
      const newDocRef = doc(activitiesRef)
      batch.set(newDocRef, {
        ...activity,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    })

    await batch.commit()
  } catch (error) {
    console.error('Error bulk creating activities:', error)
    throw error
  }
}

// ===== STATISTICS & REPORTS =====

export const getActivityStats = async (programId: string) => {
  try {
    const activities = await getActivities(programId)
    
    const totalBeneficiaries = activities.reduce(
      (acc, activity) => ({
        male: acc.male + activity.beneficiaries.male,
        female: acc.female + activity.beneficiaries.female,
        total: acc.total + activity.beneficiaries.total,
      }),
      { male: 0, female: 0, total: 0 }
    )

    const totalCost = activities.reduce(
      (sum, activity) => sum + activity.totalCost,
      0
    )

    return {
      totalActivities: activities.length,
      totalBeneficiaries,
      totalCost,
      sdgsInvolved: Array.from(
        new Set(activities.flatMap((a) => a.sdgInvolved))
      ),
      statuses: activities.reduce(
        (acc, activity) => ({
          ...acc,
          [activity.status]: (acc[activity.status] || 0) + 1,
        }),
        {} as Record<string, number>
      ),
    }
  } catch (error) {
    console.error('Error calculating stats:', error)
    throw error
  }
}
