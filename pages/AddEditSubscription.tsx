import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockFirestore } from '../services/mockFirebase';
import { CATEGORIES, CYCLES, STATUSES, Subscription } from '../types';
import { ArrowLeft, Trash2, Save, Loader2 } from 'lucide-react';

const AddEditSubscription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  
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

  useEffect(() => {
    if (isEdit && user && id) {
      mockFirestore.getSubscriptions(user.uid).then(subs => {
        const sub = subs.find(s => s.id === id);
        if (sub) {
          setFormData({
            ...sub,
            // Format input date needs YYYY-MM-DD
            startDate: sub.startDate.split('T')[0] 
          });
        }
        setFetching(false);
      });
    }
  }, [isEdit, user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (isEdit && id) {
        await mockFirestore.updateSubscription(id, formData);
      } else {
        await mockFirestore.addSubscription(user.uid, formData as any);
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
    if (confirm('Czy na pewno chcesz usunąć tę subskrypcję?')) {
      if (id) {
        await mockFirestore.deleteSubscription(id);
        navigate('/subscriptions');
      }
    }
  };

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
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nazwa usługi</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  placeholder="np. Netflix"
                />
             </div>

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
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                    />
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <div className="flex gap-2">
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
                <label className="block text-sm font-medium text-slate-400 mb-1">Notatki (opcjonalnie)</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
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