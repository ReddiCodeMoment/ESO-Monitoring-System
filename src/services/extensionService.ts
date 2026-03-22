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
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { ExtensionProgram, Project, Activity } from '../types'

// Utility function to clean undefined values from objects
const cleanUndefined = (obj: any): any => {
  const cleaned: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value
    }
  }
  return cleaned
}

// ===== EXTENSION PROGRAMS =====

export const createExtensionProgram = async (
  programData: Omit<ExtensionProgram, 'id' | 'createdAt' | 'updatedAt' | 'projects'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'extensionPrograms'), {
      title: programData.title,
      description: programData.description || '',
      location: programData.location || '',
      startDate: programData.startDate,
      endDate: programData.endDate,
      color: programData.color || '#3B82F6',
      implementingCollege: programData.implementingCollege || '',
      extensionAgenda: programData.extensionAgenda || '',
      typeOfCommunityService: programData.typeOfCommunityService || '',
      budgetUtilization: programData.budgetUtilization || 0,
      sourceOfFund: programData.sourceOfFund || '',
      status: programData.status || 'On Going',
      sdgInvolved: programData.sdgInvolved || [],
      typeOfBeneficiaries: programData.typeOfBeneficiaries || '',
      beneficiaries: programData.beneficiaries || { male: 0, female: 0, total: 0, unspecified: false },
      createdBy: programData.createdBy,
      archived: programData.archived,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
    const programs: ExtensionProgram[] = []

    for (const docSnapshot of querySnapshot.docs) {
      const programData = docSnapshot.data()
      const projectsSnapshot = await getDocs(
        collection(db, 'extensionPrograms', docSnapshot.id, 'projects')
      )
      const projects: Project[] = []

      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data()
        const activitiesSnapshot = await getDocs(
          collection(db, 'extensionPrograms', docSnapshot.id, 'projects', projectDoc.id, 'activities')
        )
        const activities = activitiesSnapshot.docs.map((actDoc) => ({
          id: actDoc.id,
          ...actDoc.data(),
          createdAt: actDoc.data().createdAt?.toDate().toISOString() || '',
          updatedAt: actDoc.data().updatedAt?.toDate().toISOString() || '',
        })) as Activity[]

        projects.push({
          id: projectDoc.id,
          ...projectData,
          activities,
          createdAt: projectData.createdAt?.toDate().toISOString() || '',
          updatedAt: projectData.updatedAt?.toDate().toISOString() || '',
        } as Project)
      }

      programs.push({
        id: docSnapshot.id,
        ...programData,
        projects,
        createdAt: programData.createdAt?.toDate().toISOString() || '',
        updatedAt: programData.updatedAt?.toDate().toISOString() || '',
      } as ExtensionProgram)
    }

    return programs
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
    if (!docSnapshot.exists()) return null

    const programData = docSnapshot.data()
    const projectsSnapshot = await getDocs(
      collection(db, 'extensionPrograms', programId, 'projects')
    )
    const projects: Project[] = []

    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data()
      const activitiesSnapshot = await getDocs(
        collection(db, 'extensionPrograms', programId, 'projects', projectDoc.id, 'activities')
      )
      const activities = activitiesSnapshot.docs.map((actDoc) => ({
        id: actDoc.id,
        ...actDoc.data(),
        createdAt: actDoc.data().createdAt?.toDate().toISOString() || '',
        updatedAt: actDoc.data().updatedAt?.toDate().toISOString() || '',
      })) as Activity[]

      projects.push({
        id: projectDoc.id,
        ...projectData,
        activities,
        createdAt: projectData.createdAt?.toDate().toISOString() || '',
        updatedAt: projectData.updatedAt?.toDate().toISOString() || '',
      } as Project)
    }

    return {
      id: docSnapshot.id,
      ...programData,
      projects,
      createdAt: programData.createdAt?.toDate().toISOString() || '',
      updatedAt: programData.updatedAt?.toDate().toISOString() || '',
    } as ExtensionProgram
  } catch (error) {
    console.error('Error fetching program:', error)
    throw error
  }
}

export const updateExtensionProgram = async (
  programId: string,
  programData: Partial<Omit<ExtensionProgram, 'id' | 'createdAt' | 'projects'>>
): Promise<void> => {
  try {
    const cleanedData = cleanUndefined(programData)
    const docRef = doc(db, 'extensionPrograms', programId)
    await updateDoc(docRef, {
      ...cleanedData,
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

// ===== PROJECTS =====

export const createProject = async (
  programId: string,
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'activities'>
): Promise<string> => {
  try {
    const docRef = await addDoc(
      collection(db, 'extensionPrograms', programId, 'projects'),
      {
        title: projectData.title,
        description: projectData.description || '',
        location: projectData.location || '',
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        extensionAgenda: projectData.extensionAgenda || '',
        typeOfCommunityService: projectData.typeOfCommunityService || '',
        status: projectData.status || 'On Going', // Default to 'On Going'
        sdgInvolved: projectData.sdgInvolved || [],
        createdBy: projectData.createdBy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    )
    
    // Aggregate SDGs from projects and activities to program
    if (projectData.sdgInvolved && projectData.sdgInvolved.length > 0) {
      await aggregateProgramSDGs(programId)
    }
    
    return docRef.id
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export const getProjectsByProgramId = async (programId: string): Promise<Project[]> => {
  try {
    const projectsSnapshot = await getDocs(
      collection(db, 'extensionPrograms', programId, 'projects')
    )
    const projects: Project[] = []

    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data()
      const activitiesSnapshot = await getDocs(
        collection(db, 'extensionPrograms', programId, 'projects', projectDoc.id, 'activities')
      )
      const activities = activitiesSnapshot.docs.map((actDoc) => ({
        id: actDoc.id,
        ...actDoc.data(),
        createdAt: actDoc.data().createdAt?.toDate().toISOString() || '',
        updatedAt: actDoc.data().updatedAt?.toDate().toISOString() || '',
      })) as Activity[]

      projects.push({
        id: projectDoc.id,
        ...projectData,
        activities,
        createdAt: projectData.createdAt?.toDate().toISOString() || '',
        updatedAt: projectData.updatedAt?.toDate().toISOString() || '',
      } as Project)
    }

    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

export const getProjectById = async (
  programId: string,
  projectId: string
): Promise<Project | null> => {
  try {
    const docRef = doc(db, 'extensionPrograms', programId, 'projects', projectId)
    const docSnapshot = await getDoc(docRef)
    if (!docSnapshot.exists()) return null

    const projectData = docSnapshot.data()
    const activitiesSnapshot = await getDocs(
      collection(db, 'extensionPrograms', programId, 'projects', projectId, 'activities')
    )
    const activities = activitiesSnapshot.docs.map((actDoc) => ({
      id: actDoc.id,
      ...actDoc.data(),
      createdAt: actDoc.data().createdAt?.toDate().toISOString() || '',
      updatedAt: actDoc.data().updatedAt?.toDate().toISOString() || '',
    })) as Activity[]

    return {
      id: docSnapshot.id,
      ...projectData,
      activities,
      createdAt: projectData.createdAt?.toDate().toISOString() || '',
      updatedAt: projectData.updatedAt?.toDate().toISOString() || '',
    } as Project
  } catch (error) {
    console.error('Error fetching project:', error)
    throw error
  }
}

export const updateProject = async (
  programId: string,
  projectId: string,
  projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'activities'>>
): Promise<void> => {
  try {
    const cleanedData = cleanUndefined(projectData)
    const docRef = doc(db, 'extensionPrograms', programId, 'projects', projectId)
    await updateDoc(docRef, {
      ...cleanedData,
      updatedAt: Timestamp.now(),
    })
    
    // Aggregate SDGs from all projects and activities to program
    if (projectData.sdgInvolved !== undefined || Object.keys(projectData).includes('sdgInvolved')) {
      await aggregateProgramSDGs(programId)
    }
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

export const deleteProject = async (
  programId: string,
  projectId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'extensionPrograms', programId, 'projects', projectId)
    await deleteDoc(docRef)
    
    // Aggregate SDGs from remaining projects and activities to program
    await aggregateProgramSDGs(programId)
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

// ===== ACTIVITIES =====

// Helper function to aggregate SDGs from all activities and projects in a program
const aggregateProgramSDGs = async (programId: string): Promise<void> => {
  try {
    const projectsSnapshot = await getDocs(
      collection(db, 'extensionPrograms', programId, 'projects')
    )
    
    const aggregatedSDGs = new Set<string>()
    
    // Collect SDGs from projects and all activities across all projects
    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data()
      
      // Add project's own SDGs if they exist
      if (projectData.sdgInvolved && Array.isArray(projectData.sdgInvolved)) {
        projectData.sdgInvolved.forEach((sdg: string) => aggregatedSDGs.add(sdg))
      }
      
      // Add SDGs from all activities in this project
      const activitiesSnapshot = await getDocs(
        collection(db, 'extensionPrograms', programId, 'projects', projectDoc.id, 'activities')
      )
      
      for (const activityDoc of activitiesSnapshot.docs) {
        const activityData = activityDoc.data()
        if (activityData.sdgInvolved && Array.isArray(activityData.sdgInvolved)) {
          activityData.sdgInvolved.forEach((sdg: string) => aggregatedSDGs.add(sdg))
        }
      }
    }
    
    // Update program with aggregated SDGs
    const programRef = doc(db, 'extensionPrograms', programId)
    await updateDoc(programRef, {
      sdgInvolved: Array.from(aggregatedSDGs),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error aggregating program SDGs:', error)
    // Don't throw - we don't want SDG aggregation to break the main operation
  }
}

export const createActivity = async (
  programId: string,
  projectId: string,
  activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const cleanedData = cleanUndefined({
      ...activityData,
      status: activityData.status || 'On Going', // Default to 'On Going'
    })
    
    const docRef = await addDoc(
      collection(db, 'extensionPrograms', programId, 'projects', projectId, 'activities'),
      {
        ...cleanedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    )
    
    // Aggregate SDGs from all activities to program
    await aggregateProgramSDGs(programId)
    
    return docRef.id
  } catch (error) {
    console.error('Error creating activity:', error)
    throw error
  }
}

export const getActivitiesByProjectId = async (
  programId: string,
  projectId: string
): Promise<Activity[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'extensionPrograms', programId, 'projects', projectId, 'activities')
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

// Backward compatibility: get all activities across all projects in a program
export const getActivities = async (programId: string): Promise<Activity[]> => {
  try {
    const projectsSnapshot = await getDocs(
      collection(db, 'extensionPrograms', programId, 'projects')
    )
    const allActivities: Activity[] = []

    for (const projectDoc of projectsSnapshot.docs) {
      const activitiesSnapshot = await getDocs(
        collection(db, 'extensionPrograms', programId, 'projects', projectDoc.id, 'activities')
      )
      const activities = activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || '',
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || '',
      })) as Activity[]
      allActivities.push(...activities)
    }

    return allActivities
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw error
  }
}

export const getActivityById = async (
  programId: string,
  projectId: string,
  activityId: string
): Promise<Activity | null> => {
  try {
    const docRef = doc(
      db,
      'extensionPrograms',
      programId,
      'projects',
      projectId,
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
  projectId: string,
  activityId: string,
  activityData: Partial<Omit<Activity, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const cleanedData = cleanUndefined(activityData)
    const docRef = doc(
      db,
      'extensionPrograms',
      programId,
      'projects',
      projectId,
      'activities',
      activityId
    )
    await updateDoc(docRef, {
      ...cleanedData,
      updatedAt: Timestamp.now(),
    })
    
    // Aggregate SDGs from all activities to program
    await aggregateProgramSDGs(programId)
  } catch (error) {
    console.error('Error updating activity:', error)
    throw error
  }
}

export const deleteActivity = async (
  programId: string,
  projectId: string,
  activityId: string
): Promise<void> => {
  try {
    const docRef = doc(
      db,
      'extensionPrograms',
      programId,
      'projects',
      projectId,
      'activities',
      activityId
    )
    await deleteDoc(docRef)
    
    // Aggregate SDGs from remaining activities to program
    await aggregateProgramSDGs(programId)
  } catch (error) {
    console.error('Error deleting activity:', error)
    throw error
  }
}

// ===== BATCH OPERATIONS =====

export const createBulkActivities = async (
  programId: string,
  projectId: string,
  activities: Array<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const activitiesRef = collection(
      db,
      'extensionPrograms',
      programId,
      'projects',
      projectId,
      'activities'
    )

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

export const getActivityStats = async (programId: string, projectId?: string) => {
  try {
    let activities: Activity[] = []

    if (projectId) {
      // Get stats for specific project
      activities = await getActivitiesByProjectId(programId, projectId)
    } else {
      // Get stats for entire program (all projects)
      activities = await getActivities(programId)
    }

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

    const sdgsInvolved = [...new Set(activities.flatMap(a => a.sdgInvolved))]

    return {
      totalActivities: activities.length,
      totalBeneficiaries,
      totalCost,
      sdgCoverage: sdgsInvolved.length,
      activitiesCount: activities.length,
      sdgsInvolved,
    }
  } catch (error) {
    console.error('Error calculating activity stats:', error)
    throw error
  }
}
