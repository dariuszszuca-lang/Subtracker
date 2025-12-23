
import { db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import {
  Subscription,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  FamilyGroup,
  FamilyMember,
  FamilyInvite,
  SharedSubscription,
  FamilyGroupSummary,
  CostSplit
} from '../types';
import { getMonthlyCost, convertToPLN } from '../utils/helpers';

export const dbService = {
  getSubscriptions: async (userId: string): Promise<Subscription[]> => {
    try {
      const q = query(collection(db, `users/${userId}/subscriptions`));
      const querySnapshot = await getDocs(q);
      
      const subs: Subscription[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as Subscription);
      });
      return subs;
    } catch (error) {
      console.error("Błąd pobierania subskrypcji:", error);
      return [];
    }
  },

  addSubscription: async (userId: string, sub: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newSubData = {
      ...sub,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Dodajemy do podkolekcji users/{userId}/subscriptions
    const docRef = await addDoc(collection(db, `users/${userId}/subscriptions`), newSubData);
    return { id: docRef.id, ...newSubData };
  },

  updateSubscription: async (userId: string, subId: string, updates: Partial<Subscription>) => {
    const subRef = doc(db, `users/${userId}/subscriptions`, subId);
    await updateDoc(subRef, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  deleteSubscription: async (userId: string, subId: string) => {
    const subRef = doc(db, `users/${userId}/subscriptions`, subId);
    await deleteDoc(subRef);
  },
  
  // Pobieranie pojedynczej subskrypcji
  getSubscription: async (userId: string, subId: string): Promise<Subscription | null> => {
    const subRef = doc(db, `users/${userId}/subscriptions`, subId);
    const docSnap = await getDoc(subRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Subscription;
    } else {
      return null;
    }
  }
};

// Funkcje do zarządzania ustawieniami powiadomień
export const getUserNotificationSettings = async (userId: string): Promise<NotificationSettings | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().notifications) {
      return docSnap.data().notifications as NotificationSettings;
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error("Błąd pobierania ustawień powiadomień:", error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

export const updateUserNotificationSettings = async (userId: string, settings: NotificationSettings): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      await updateDoc(userRef, { notifications: settings });
    } else {
      // Jeśli dokument nie istnieje, tworzymy go z ustawieniami
      const { setDoc } = await import('firebase/firestore');
      await setDoc(userRef, { notifications: settings }, { merge: true });
    }
  } catch (error) {
    console.error("Błąd zapisu ustawień powiadomień:", error);
    throw error;
  }
};

// ============================================
// WSPÓŁDZIELENIE KOSZTÓW - Family Groups
// ============================================

export const familyService = {
  // Tworzenie nowej grupy rodzinnej
  createGroup: async (
    userId: string,
    userEmail: string,
    userName: string,
    groupName: string
  ): Promise<FamilyGroup> => {
    const owner: FamilyMember = {
      userId,
      email: userEmail,
      displayName: userName,
      role: 'owner',
      joinedAt: Date.now()
    };

    const newGroup: Omit<FamilyGroup, 'id'> = {
      name: groupName,
      ownerId: userId,
      members: [owner],
      sharedSubscriptions: [],
      invites: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const docRef = await addDoc(collection(db, 'familyGroups'), newGroup);
    return { id: docRef.id, ...newGroup };
  },

  // Pobieranie grup użytkownika
  getUserGroups: async (userId: string): Promise<FamilyGroup[]> => {
    try {
      const q = query(collection(db, 'familyGroups'));
      const querySnapshot = await getDocs(q);

      const groups: FamilyGroup[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<FamilyGroup, 'id'>;
        // Sprawdź czy użytkownik jest członkiem
        if (data.members.some(m => m.userId === userId)) {
          groups.push({ id: docSnap.id, ...data });
        }
      });
      return groups;
    } catch (error) {
      console.error("Błąd pobierania grup:", error);
      return [];
    }
  },

  // Pobieranie pojedynczej grupy
  getGroup: async (groupId: string): Promise<FamilyGroup | null> => {
    try {
      const groupRef = doc(db, 'familyGroups', groupId);
      const docSnap = await getDoc(groupRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FamilyGroup;
      }
      return null;
    } catch (error) {
      console.error("Błąd pobierania grupy:", error);
      return null;
    }
  },

  // Wysłanie zaproszenia
  sendInvite: async (groupId: string, email: string, invitedBy: string): Promise<FamilyInvite> => {
    const groupRef = doc(db, 'familyGroups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error('Grupa nie istnieje');

    const group = groupSnap.data() as FamilyGroup;

    // Sprawdź czy email już jest członkiem
    if (group.members.some(m => m.email === email)) {
      throw new Error('Ta osoba jest już w grupie');
    }

    // Sprawdź czy zaproszenie już istnieje
    if (group.invites?.some(i => i.email === email && i.status === 'pending')) {
      throw new Error('Zaproszenie już zostało wysłane');
    }

    const invite: FamilyInvite = {
      id: `inv_${Date.now()}`,
      groupId,
      email,
      invitedBy,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dni
    };

    await updateDoc(groupRef, {
      invites: [...(group.invites || []), invite],
      updatedAt: Date.now()
    });

    return invite;
  },

  // Akceptowanie zaproszenia
  acceptInvite: async (
    groupId: string,
    inviteId: string,
    userId: string,
    userEmail: string,
    userName: string
  ): Promise<void> => {
    const groupRef = doc(db, 'familyGroups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error('Grupa nie istnieje');

    const group = groupSnap.data() as FamilyGroup;
    const invite = group.invites?.find(i => i.id === inviteId);

    if (!invite || invite.status !== 'pending') {
      throw new Error('Nieprawidłowe zaproszenie');
    }

    if (invite.email !== userEmail) {
      throw new Error('To zaproszenie nie jest dla Ciebie');
    }

    const newMember: FamilyMember = {
      userId,
      email: userEmail,
      displayName: userName,
      role: 'member',
      joinedAt: Date.now()
    };

    const updatedInvites = group.invites.map(i =>
      i.id === inviteId ? { ...i, status: 'accepted' as const } : i
    );

    await updateDoc(groupRef, {
      members: [...group.members, newMember],
      invites: updatedInvites,
      updatedAt: Date.now()
    });
  },

  // Dodawanie współdzielonej subskrypcji
  addSharedSubscription: async (
    groupId: string,
    subscription: Subscription,
    splitType: 'equal' | 'percentage' | 'fixed',
    paidBy: string,
    addedBy: string
  ): Promise<void> => {
    const groupRef = doc(db, 'familyGroups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error('Grupa nie istnieje');

    const group = groupSnap.data() as FamilyGroup;
    const monthlyAmount = getMonthlyCost(subscription.amount, subscription.cycle);

    // Oblicz podział kosztów
    const splits: CostSplit[] = group.members.map(member => {
      let calculatedAmount = 0;
      if (splitType === 'equal') {
        calculatedAmount = monthlyAmount / group.members.length;
      }
      return {
        memberId: member.userId,
        memberName: member.displayName,
        type: splitType,
        value: splitType === 'equal' ? 1 : 0,
        calculatedAmount: Number(calculatedAmount.toFixed(2))
      };
    });

    const sharedSub: SharedSubscription = {
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      totalAmount: monthlyAmount,
      currency: subscription.currency,
      cycle: subscription.cycle,
      splitType,
      splits,
      paidBy,
      addedBy,
      addedAt: Date.now()
    };

    await updateDoc(groupRef, {
      sharedSubscriptions: [...(group.sharedSubscriptions || []), sharedSub],
      updatedAt: Date.now()
    });
  },

  // Aktualizacja podziału kosztów
  updateCostSplits: async (
    groupId: string,
    subscriptionId: string,
    splits: CostSplit[]
  ): Promise<void> => {
    const groupRef = doc(db, 'familyGroups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error('Grupa nie istnieje');

    const group = groupSnap.data() as FamilyGroup;
    const updatedSubs = group.sharedSubscriptions.map(sub =>
      sub.subscriptionId === subscriptionId
        ? { ...sub, splits }
        : sub
    );

    await updateDoc(groupRef, {
      sharedSubscriptions: updatedSubs,
      updatedAt: Date.now()
    });
  },

  // Usuwanie współdzielonej subskrypcji z grupy
  removeSharedSubscription: async (groupId: string, subscriptionId: string): Promise<void> => {
    const groupRef = doc(db, 'familyGroups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error('Grupa nie istnieje');

    const group = groupSnap.data() as FamilyGroup;
    const updatedSubs = group.sharedSubscriptions.filter(
      sub => sub.subscriptionId !== subscriptionId
    );

    await updateDoc(groupRef, {
      sharedSubscriptions: updatedSubs,
      updatedAt: Date.now()
    });
  },

  // Podsumowanie grupy dla użytkownika
  getGroupSummary: async (groupId: string, userId: string): Promise<FamilyGroupSummary | null> => {
    const group = await familyService.getGroup(groupId);
    if (!group) return null;

    let totalMonthly = 0;
    let myShare = 0;

    group.sharedSubscriptions.forEach(sub => {
      const monthlyInPLN = convertToPLN(sub.totalAmount, sub.currency);
      totalMonthly += monthlyInPLN;

      const mySplit = sub.splits.find(s => s.memberId === userId);
      if (mySplit) {
        myShare += convertToPLN(mySplit.calculatedAmount, sub.currency);
      }
    });

    return {
      groupId: group.id,
      groupName: group.name,
      totalMonthly: Number(totalMonthly.toFixed(2)),
      myShare: Number(myShare.toFixed(2)),
      membersCount: group.members.length,
      subscriptionsCount: group.sharedSubscriptions.length
    };
  },

  // Usuwanie członka z grupy
  removeMember: async (groupId: string, memberIdToRemove: string, requestingUserId: string): Promise<void> => {
    const groupRef = doc(db, 'familyGroups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error('Grupa nie istnieje');

    const group = groupSnap.data() as FamilyGroup;

    // Sprawdź uprawnienia
    const requestingMember = group.members.find(m => m.userId === requestingUserId);
    if (!requestingMember || (requestingMember.role !== 'owner' && requestingMember.role !== 'admin')) {
      throw new Error('Brak uprawnień');
    }

    // Nie można usunąć właściciela
    if (group.ownerId === memberIdToRemove) {
      throw new Error('Nie można usunąć właściciela grupy');
    }

    const updatedMembers = group.members.filter(m => m.userId !== memberIdToRemove);

    // Usuń osobę z podziałów kosztów
    const updatedSubs = group.sharedSubscriptions.map(sub => ({
      ...sub,
      splits: sub.splits.filter(s => s.memberId !== memberIdToRemove)
    }));

    await updateDoc(groupRef, {
      members: updatedMembers,
      sharedSubscriptions: updatedSubs,
      updatedAt: Date.now()
    });
  },

  // Usuwanie grupy
  deleteGroup: async (groupId: string, userId: string): Promise<void> => {
    const groupRef = doc(db, 'familyGroups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error('Grupa nie istnieje');

    const group = groupSnap.data() as FamilyGroup;

    if (group.ownerId !== userId) {
      throw new Error('Tylko właściciel może usunąć grupę');
    }

    await deleteDoc(groupRef);
  }
};
