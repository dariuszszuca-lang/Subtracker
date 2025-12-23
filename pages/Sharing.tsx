
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService, familyService } from '../services/firebaseService';
import { FamilyGroup, Subscription, SharedSubscription, FamilyMember } from '../types';
import { formatCurrency, getMonthlyCost, convertToPLN } from '../utils/helpers';
import {
  Users, Plus, UserPlus, Trash2, CreditCard, Mail, Crown, Shield, User,
  X, Check, Loader2, Share2, PieChart, ArrowRight
} from 'lucide-react';

const Sharing: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);

  // Modals
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [groupsData, subsData] = await Promise.all([
        familyService.getUserGroups(user.uid),
        dbService.getSubscriptions(user.uid)
      ]);
      setGroups(groupsData);
      setSubscriptions(subsData.filter(s => s.status === 'active' || s.status === 'trial'));
      if (groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0]);
      }
    } catch (error) {
      console.error('Błąd ładowania danych:', error);
    } finally {
      setLoading(false);
    }
  };

  // Oblicz podsumowanie dla wybranej grupy
  const groupSummary = useMemo(() => {
    if (!selectedGroup || !user) return null;

    let totalMonthly = 0;
    let myShare = 0;

    selectedGroup.sharedSubscriptions?.forEach(sub => {
      const monthlyInPLN = convertToPLN(sub.totalAmount, sub.currency);
      totalMonthly += monthlyInPLN;

      const mySplit = sub.splits?.find(s => s.memberId === user.uid);
      if (mySplit) {
        myShare += mySplit.calculatedAmount;
      }
    });

    return {
      totalMonthly: Number(totalMonthly.toFixed(2)),
      myShare: Number(myShare.toFixed(2)),
      savings: Number((totalMonthly - myShare).toFixed(2))
    };
  }, [selectedGroup, user]);

  // Tworzenie grupy
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroupName.trim()) return;

    setActionLoading(true);
    try {
      const newGroup = await familyService.createGroup(
        user.uid,
        user.email || '',
        user.displayName || 'Użytkownik',
        newGroupName.trim()
      );
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setNewGroupName('');
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Błąd tworzenia grupy:', error);
      alert('Nie udało się utworzyć grupy');
    } finally {
      setActionLoading(false);
    }
  };

  // Wysyłanie zaproszenia
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroup || !inviteEmail.trim()) return;

    setActionLoading(true);
    try {
      await familyService.sendInvite(selectedGroup.id, inviteEmail.trim(), user.uid);
      await loadData();
      setInviteEmail('');
      setShowInvite(false);
      alert('Zaproszenie wysłane!');
    } catch (error: any) {
      alert(error.message || 'Nie udało się wysłać zaproszenia');
    } finally {
      setActionLoading(false);
    }
  };

  // Dodawanie subskrypcji do współdzielenia
  const handleAddSharedSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroup || !selectedSubId) return;

    const subscription = subscriptions.find(s => s.id === selectedSubId);
    if (!subscription) return;

    setActionLoading(true);
    try {
      await familyService.addSharedSubscription(
        selectedGroup.id,
        subscription,
        'equal',
        user.uid,
        user.uid
      );
      await loadData();
      setSelectedSubId('');
      setShowAddSub(false);
    } catch (error) {
      console.error('Błąd dodawania subskrypcji:', error);
      alert('Nie udało się dodać subskrypcji');
    } finally {
      setActionLoading(false);
    }
  };

  // Usuwanie współdzielonej subskrypcji
  const handleRemoveSharedSub = async (subscriptionId: string) => {
    if (!selectedGroup || !confirm('Usunąć tę subskrypcję ze współdzielenia?')) return;

    try {
      await familyService.removeSharedSubscription(selectedGroup.id, subscriptionId);
      await loadData();
    } catch (error) {
      console.error('Błąd usuwania:', error);
    }
  };

  // Usuwanie członka
  const handleRemoveMember = async (memberId: string) => {
    if (!user || !selectedGroup || !confirm('Usunąć tę osobę z grupy?')) return;

    try {
      await familyService.removeMember(selectedGroup.id, memberId, user.uid);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Nie udało się usunąć członka');
    }
  };

  // Ikona roli
  const RoleIcon = ({ role }: { role: string }) => {
    if (role === 'owner') return <Crown className="w-4 h-4 text-yellow-400" />;
    if (role === 'admin') return <Shield className="w-4 h-4 text-blue-400" />;
    return <User className="w-4 h-4 text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Brak grup - zachęta do stworzenia
  if (groups.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Współdzielenie kosztów</h2>
          <p className="text-slate-400 text-sm mt-1">Dziel subskrypcje z rodziną i znajomymi</p>
        </div>

        <div className="bg-surface border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">Stwórz grupę rodzinną</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            Zaproś członków rodziny lub znajomych i dzielcie koszty wspólnych subskrypcji.
            Netflix, Spotify, iCloud - wszystko w jednym miejscu.
          </p>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Utwórz pierwszą grupę
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface/50 border border-slate-700/30 rounded-xl p-5">
            <Share2 className="w-8 h-8 text-primary mb-3" />
            <h4 className="font-medium mb-1">Dziel automatycznie</h4>
            <p className="text-sm text-slate-400">Koszty dzielą się równo lub wg własnych proporcji</p>
          </div>
          <div className="bg-surface/50 border border-slate-700/30 rounded-xl p-5">
            <PieChart className="w-8 h-8 text-accent mb-3" />
            <h4 className="font-medium mb-1">Śledź wydatki</h4>
            <p className="text-sm text-slate-400">Zobacz ile każdy oszczędza dzięki współdzieleniu</p>
          </div>
          <div className="bg-surface/50 border border-slate-700/30 rounded-xl p-5">
            <UserPlus className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="font-medium mb-1">Do 5 osób</h4>
            <p className="text-sm text-slate-400">Zaproś rodzinę przez email</p>
          </div>
        </div>

        {/* Modal tworzenia grupy */}
        {showCreateGroup && (
          <Modal onClose={() => setShowCreateGroup(false)} title="Utwórz grupę">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nazwa grupy</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="np. Rodzina Kowalskich"
                  className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                Utwórz grupę
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  // Główny widok z grupami
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Współdzielenie kosztów</h2>
          <p className="text-slate-400 text-sm mt-1">Zarządzaj grupami i dziel wydatki</p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nowa grupa
        </button>
      </div>

      {/* Lista grup (tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {groups.map(group => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedGroup?.id === group.id
                ? 'bg-primary text-white'
                : 'bg-surface border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            {group.name}
            <span className="ml-2 text-xs opacity-70">({group.members.length})</span>
          </button>
        ))}
      </div>

      {selectedGroup && (
        <>
          {/* Podsumowanie grupy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface border border-slate-700/50 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-1">Suma miesięczna grupy</div>
              <div className="text-2xl font-bold">{formatCurrency(groupSummary?.totalMonthly || 0, 'PLN')}</div>
            </div>
            <div className="bg-surface border border-slate-700/50 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-1">Twój udział</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(groupSummary?.myShare || 0, 'PLN')}</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-5">
              <div className="text-green-400 text-sm mb-1">Twoje oszczędności</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(groupSummary?.savings || 0, 'PLN')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Członkowie */}
            <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Członkowie ({selectedGroup.members.length}/5)
                </h3>
                {selectedGroup.members.length < 5 && (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="text-primary hover:text-primaryHover"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {selectedGroup.members.map(member => (
                  <div key={member.userId} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate flex items-center gap-2">
                        {member.displayName}
                        <RoleIcon role={member.role} />
                      </div>
                      <div className="text-xs text-slate-500 truncate">{member.email}</div>
                    </div>
                    {member.role !== 'owner' && selectedGroup.ownerId === user?.uid && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Oczekujące zaproszenia */}
                {selectedGroup.invites?.filter(i => i.status === 'pending').map(invite => (
                  <div key={invite.id} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{invite.email}</div>
                      <div className="text-xs text-yellow-400">Oczekuje na akceptację</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Współdzielone subskrypcje */}
            <div className="lg:col-span-2 bg-surface border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" />
                  Współdzielone subskrypcje
                </h3>
                <button
                  onClick={() => setShowAddSub(true)}
                  className="text-sm text-primary hover:text-primaryHover flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj
                </button>
              </div>

              {selectedGroup.sharedSubscriptions?.length > 0 ? (
                <div className="space-y-3">
                  {selectedGroup.sharedSubscriptions.map(sub => (
                    <SharedSubCard
                      key={sub.subscriptionId}
                      sub={sub}
                      currentUserId={user?.uid || ''}
                      onRemove={() => handleRemoveSharedSub(sub.subscriptionId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Brak współdzielonych subskrypcji</p>
                  <button
                    onClick={() => setShowAddSub(true)}
                    className="text-primary text-sm mt-2 hover:underline"
                  >
                    Dodaj pierwszą subskrypcję
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showCreateGroup && (
        <Modal onClose={() => setShowCreateGroup(false)} title="Utwórz nową grupę">
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nazwa grupy</label>
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="np. Rodzina Kowalskich"
                className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
              Utwórz grupę
            </button>
          </form>
        </Modal>
      )}

      {showInvite && (
        <Modal onClose={() => setShowInvite(false)} title="Zaproś do grupy">
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Adres email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                Osoba otrzyma zaproszenie po zalogowaniu się do SubTracker
              </p>
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Mail className="w-5 h-5" />}
              Wyślij zaproszenie
            </button>
          </form>
        </Modal>
      )}

      {showAddSub && (
        <Modal onClose={() => setShowAddSub(false)} title="Dodaj subskrypcję do współdzielenia">
          <form onSubmit={handleAddSharedSub} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Wybierz subskrypcję</label>
              <select
                value={selectedSubId}
                onChange={e => setSelectedSubId(e.target.value)}
                className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                required
              >
                <option value="">Wybierz...</option>
                {subscriptions
                  .filter(s => !selectedGroup?.sharedSubscriptions?.some(ss => ss.subscriptionId === s.id))
                  .map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} - {formatCurrency(getMonthlyCost(sub.amount, sub.cycle), sub.currency)}/mc
                    </option>
                  ))
                }
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Koszty zostaną automatycznie podzielone równo między członków grupy
              </p>
            </div>
            <button
              type="submit"
              disabled={actionLoading || !selectedSubId}
              className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              Dodaj do współdzielenia
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Komponent Modal
const Modal: React.FC<{ onClose: () => void; title: string; children: React.ReactNode }> = ({
  onClose,
  title,
  children
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="font-bold">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

// Komponent współdzielonej subskrypcji
const SharedSubCard: React.FC<{
  sub: SharedSubscription;
  currentUserId: string;
  onRemove: () => void;
}> = ({ sub, currentUserId, onRemove }) => {
  const myShare = sub.splits?.find(s => s.memberId === currentUserId);

  return (
    <div className="bg-background/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">{sub.subscriptionName}</div>
        <button onClick={onRemove} className="text-slate-500 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-slate-400">Razem: </span>
          <span className="font-medium">{formatCurrency(sub.totalAmount, sub.currency)}/mc</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500" />
        <div>
          <span className="text-slate-400">Twój udział: </span>
          <span className="font-medium text-primary">
            {formatCurrency(myShare?.calculatedAmount || 0, sub.currency)}/mc
          </span>
        </div>
      </div>

      {/* Podział między członków */}
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex flex-wrap gap-2">
          {sub.splits?.map(split => (
            <div
              key={split.memberId}
              className={`text-xs px-2 py-1 rounded-full ${
                split.memberId === currentUserId
                  ? 'bg-primary/20 text-primary'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              {split.memberName}: {formatCurrency(split.calculatedAmount, sub.currency)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sharing;
