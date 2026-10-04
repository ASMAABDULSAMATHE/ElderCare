import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealPlan } from '../types';
import { formatCurrentDate } from '../utils/dateUtils';
import {
  Utensils,
  Clock,
  Heart,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Check,
  X,
  FileText,
  Sparkles,
  ShieldCheck,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const MealPlanView: React.FC = () => {
  const {
    meals,
    isCaregiverAuthenticated,
    addMeal,
    updateMeal,
    deleteMeal,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<{ id: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    title: string;
    time: string;
    description: string;
    preferences: string;
    preferredIngredients: string;
    allergens: string;
    specialInstructions: string;
  }>({
    type: 'breakfast',
    title: '',
    time: '8:30 AM',
    description: '',
    preferences: '',
    preferredIngredients: '',
    allergens: '',
    specialInstructions: '',
  });

  const handleOpenAdd = () => {
    setEditingMeal(null);
    setFormData({
      type: 'breakfast',
      title: 'Breakfast',
      time: '8:30 AM',
      description: '',
      preferences: 'Soft texture, low sodium',
      preferredIngredients: '',
      allergens: 'None',
      specialInstructions: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meal: MealPlan) => {
    setEditingMeal(meal);
    setFormData({
      type: meal.type,
      title: meal.title,
      time: meal.time,
      description: meal.description,
      preferences: meal.preferences || '',
      preferredIngredients: meal.preferredIngredients || '',
      allergens: meal.allergens || '',
      specialInstructions: meal.specialInstructions || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.time) return;

    if (editingMeal) {
      updateMeal(editingMeal.id, formData);
    } else {
      addMeal(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    setDeletingMeal({ id, title });
  };

  const handleConfirmDelete = () => {
    if (deletingMeal) {
      deleteMeal(deletingMeal.id);
      setDeletingMeal(null);
    }
  };

  const filteredMeals = meals.filter((meal) => {
    if (filterType === 'all') return true;
    return meal.type === filterType;
  });

  const getMealTypeBadge = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'lunch':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'snack':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'dinner':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              ElderCare Nutrition
            </span>
            {isCaregiverAuthenticated ? (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Caregiver Mode Active
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Protected Plan (View Only)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Today's Meal Plan
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 flex flex-wrap items-center gap-2">
            <span>Caregiver-managed nutrition schedule, allergen guidelines, and dietary preferences.</span>
            <span className="font-semibold text-teal-900 bg-teal-100/80 px-2.5 py-0.5 rounded-lg text-xs">
              Today: {formatCurrentDate()}
            </span>
          </p>
        </div>

        {/* Action Button: Add Meal (Only for authenticated Caregivers) */}
        {isCaregiverAuthenticated && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="min-h-[46px] w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-98 touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Add Meal</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs - Smooth horizontal scrolling on mobile */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Meals' },
          { id: 'breakfast', label: 'Breakfast' },
          { id: 'lunch', label: 'Lunch' },
          { id: 'snack', label: 'Snacks' },
          { id: 'dinner', label: 'Dinner' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`min-h-[40px] px-4 py-1.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 active:scale-95 touch-manipulation ${
              filterType === tab.id
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meals List */}
      <div className="space-y-5">
        {filteredMeals.map((meal) => (
          <div
            key={meal.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4"
          >
            {/* Header: Meal Pill and Time Pill perfectly sized and aligned in one line */}
            <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-950 bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs whitespace-nowrap">
                {meal.title || meal.type}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm sm:text-base font-black font-mono text-amber-950 bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{meal.time}</span>
                </span>

                {/* Caregiver Actions: Edit & Delete */}
                {isCaregiverAuthenticated && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(meal)}
                      className="p-1.5 sm:p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      aria-label={`Edit ${meal.title}`}
                    >
                      <Edit2 className="w-3.5 h-3.5 text-teal-700" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(meal.id, meal.title)}
                      className="p-1.5 sm:p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      aria-label={`Delete ${meal.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-800 leading-snug">
              {meal.description}
            </p>

            {/* Structured Details: Preferences, Ingredients, Allergens, Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-sm">
              {/* Food Preferences */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                  <Heart className="w-3.5 h-3.5 text-teal-600" />
                  <span>Food Preferences</span>
                </span>
                <p className="text-slate-800 font-semibold">
                  {meal.preferences || 'Standard healthy senior preparation'}
                </p>
              </div>

              {/* Preferred Ingredients */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span>Preferred Ingredients</span>
                </span>
                <p className="text-slate-800 font-semibold">
                  {meal.preferredIngredients || 'Fresh local seasonal ingredients'}
                </p>
              </div>

              {/* Allergens Warning / Safety */}
              {meal.allergens?.toLowerCase().includes('contains') ? (
                <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Allergens & Restrictions</span>
                  </span>
                  <p className="text-rose-950 font-bold">
                    {meal.allergens}
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Allergens & Restrictions</span>
                  </span>
                  <p className="text-emerald-950 font-bold">
                    {meal.allergens || '100% Allergy-Friendly (No known allergens)'}
                  </p>
                </div>
              )}

              {/* Special Food Instructions */}
              <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-200">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5 mb-1">
                  <Info className="w-3.5 h-3.5 text-teal-700" />
                  <span>Special Food Instructions</span>
                </span>
                <p className="text-teal-950 font-medium">
                  {meal.specialInstructions || 'Ensure easy swallowing and serve warm with water.'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Meal Modal (Caregiver Only) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingMeal ? 'Edit Meal Plan' : 'Add New Meal'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as any,
                        title:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      })
                    }
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-teal-600 bg-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Optional Snack</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    placeholder="e.g. 8:30 AM"
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Meal Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  placeholder="e.g. Breakfast, Afternoon Tea & Snack"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Meal Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  placeholder="e.g. Warm oatmeal with banana slices and herbal mint tea"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Food Preferences
                </label>
                <input
                  type="text"
                  value={formData.preferences}
                  placeholder="e.g. Soft texture, warm beverage, low sugar, low sodium"
                  onChange={(e) =>
                    setFormData({ ...formData, preferences: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Preferred Ingredients
                </label>
                <input
                  type="text"
                  value={formData.preferredIngredients}
                  placeholder="e.g. Rolled oats, ripe banana, mint leaves, honey"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredIngredients: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
                  Allergens & Intolerances
                </label>
                <input
                  type="text"
                  value={formData.allergens}
                  placeholder="e.g. Dairy-free, peanut-free, gluten-free, egg-free"
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-rose-300 text-sm font-bold text-rose-950 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">
                  Special Food Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.specialInstructions}
                  placeholder="e.g. Debone fish thoroughly, serve warm, slice fruit into small thin bites"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialInstructions: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[46px] rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[46px] rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMeal ? 'Update Meal' : 'Save Meal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Iframe & Web Safe) */}
      {deletingMeal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Remove from Meal Plan?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to remove <strong>"{deletingMeal.title}"</strong>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMeal(null)}
                className="min-h-[46px] rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
