
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebaseService';
import { CATEGORIES, CYCLES, STATUSES, Subscription } from '../types';
import { ArrowLeft, Trash2, Loader2, Search, ExternalLink } from 'lucide-react';
import { searchServices, ServiceTemplate, getServiceByName } from '../data/services';
import { calculateNextPayment } from '../utils/helpers';

const AddEditSubscription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ServiceTemplate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    amount: 0,
    currency: 'PLN',
    cycle: 'monthly',
    billingDay: new Date().getDate(),
    startDate: new Date().toISOString().split('T')[0],
    category: 'other',
    status: 'active',
    notes: '',
    url: ''
  });

  // Zamknij sugestie po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Wyszukiwanie serwisów
  useEffect(() => {
    if (!isEdit && searchQuery.length > 0) {
      const results = searchServices(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
    } else if (!isEdit && searchQuery.length === 0) {
      setSuggestions(searchServices('')); // Pokaż popularne
    }
  }, [searchQuery, isEdit]);

  useEffect(() => {
    if (isEdit && user && id) {
      dbService.getSubscription(user.uid, id).then(sub => {
        if (sub) {
          setFormData({
            ...sub,
            startDate: sub.startDate.split('T')[0]
          });
          setSearchQuery(sub.name);
        }
        setFetching(false);
      });
    } else {
      setFetching(false);
    }
  }, [isEdit, user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData(prev => ({ ...prev, name: value }));
  };

  const selectService = (service: ServiceTemplate) => {
    setSearchQuery(service.name);
    setFormData(prev => ({
      ...prev,
      name: service.name,
      amount: service.defaultAmount,
      currency: service.defaultCurrency,
      cycle: service.defaultCycle,
      category: service.category,
      url: service.website ? `https://${service.website}` : ''
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Oblicz nextPayment na podstawie startDate i cycle
      const nextPaymentDate = calculateNextPayment(
        formData.startDate || new Date().toISOString().split('T')[0],
        formData.cycle || 'monthly'
      );
      const dataToSave = {
        ...formData,
        nextPayment: nextPaymentDate.toISOString().split('T')[0]
      };

      if (isEdit && id) {
        await dbService.updateSubscription(user.uid, id, dataToSave);
      } else {
        await dbService.addSubscription(user.uid, dataToSave as any);
      }
      navigate('/subscriptions');
    } catch (error) {
      console.error(error);
      alert('Błąd podczas zapisywania');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirm('Czy na pewno chcesz usunąć tę subskrypcję?')) {
      if (id) {
        await dbService.deleteSubscription(user.uid, id);
        navigate('/subscriptions');
      }
    }
  };

  const selectedService = getServiceByName(formData.name || '');

  if (fetching) return <div className="p-8 text-center text-slate-400">Ładowanie...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Wróć
      </button>

      <div className="bg-surface border border-slate-700/50 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{isEdit ? 'Edytuj subskrypcję' : 'Dodaj subskrypcję'}</h2>
          {isEdit && (
            <button onClick={handleDelete} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
             {/* Wyszukiwarka z autouzupełnianiem */}
             <div ref={searchRef} className="relative">
                <label className="block text-sm font-medium text-slate-400 mb-1">Nazwa usługi</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => !isEdit && setShowSuggestions(true)}
                    className="w-full bg-background border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary"
                    placeholder="Wpisz nazwę np. Netflix, Spotify..."
                    autoComplete="off"
                  />
                </div>

                {/* Dropdown z sugestiami */}
                {showSuggestions && suggestions.length > 0 && !isEdit && (
                  <div className="absolute z-50 w-full mt-2 bg-surface border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                    <div className="p-2 text-xs text-slate-500 border-b border-slate-700">
                      {searchQuery ? 'Wyniki wyszukiwania' : 'Popularne serwisy'}
                    </div>
                    {suggestions.map((service, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectService(service)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
                      >
                        <span className="text-2xl">{service.logo}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{service.name}</div>
                          <div className="text-xs text-slate-500">
                            {service.defaultAmount} {service.defaultCurrency}/{service.defaultCycle === 'monthly' ? 'mc' : service.defaultCycle === 'yearly' ? 'rok' : service.defaultCycle}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${CATEGORIES.find(c => c.value === service.category)?.color}`}>
                          {CATEGORIES.find(c => c.value === service.category)?.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
             </div>

             {/* Wybrany serwis - podgląd */}
             {selectedService && !isEdit && (
               <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                 <span className="text-3xl">{selectedService.logo}</span>
                 <div className="flex-1">
                   <div className="font-medium">{selectedService.name}</div>
                   <div className="text-xs text-slate-400">Automatycznie uzupełniono dane</div>
                 </div>
                 {selectedService.website && (
                   <a
                     href={`https://${selectedService.website}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-primary hover:underline text-sm flex items-center gap-1"
                   >
                     <ExternalLink size={14} />
                     Strona
                   </a>
                 )}
               </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Kwota</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Waluta</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  >
                    <option value="PLN">PLN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cykl</label>
                  <select
                    name="cycle"
                    value={formData.cycle}
                    onChange={handleChange}
                    className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  >
                    {CYCLES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Dzień rozliczenia</label>
                  <input
                    type="number"
                    name="billingDay"
                    min="1"
                    max="31"
                    value={formData.billingDay}
                    onChange={handleChange}
                    className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Kategoria</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  >
                     {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1">Pierwsza płatność</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      min="2000-01-01"
                      max="2099-12-31"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                    />
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, status: s.value }))}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        formData.status === s.value
                        ? `border-${s.color.split('-')[1]}-500 bg-${s.color.split('-')[1]}-500/20 text-white`
                        : 'border-slate-700 text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL strony (opcjonalnie)</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  placeholder="https://"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Notatki (opcjonalnie)</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  placeholder="Np. konto rodzinne, współdzielone z..."
                />
             </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50 flex justify-end">
             <button
               type="submit"
               disabled={loading}
               className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-xl font-medium flex items-center shadow-lg shadow-primary/25 disabled:opacity-50"
             >
               {loading && <Loader2 className="animate-spin mr-2" size={18} />}
               {isEdit ? 'Zapisz zmiany' : 'Dodaj subskrypcję'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditSubscription;
