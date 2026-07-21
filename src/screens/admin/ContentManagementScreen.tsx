import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Edit2, 
  Eye, 
  EyeOff, 
  Trash2, 
  Check, 
  X, 
  Award, 
  Calendar, 
  Users, 
  GraduationCap, 
  ShieldAlert, 
  User, 
  CheckCircle2, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContentManagementScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack: () => void;
}

export const ContentManagementScreen: React.FC<ContentManagementScreenProps> = ({ 
  addToast, 
  onBack 
}) => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'lessons' | 'challenges' | 'experts'>('lessons');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filtering
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');

  // Lists
  const [lessons, setLessons] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Inline Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Separate structures for FormData
  const [lessonForm, setLessonForm] = useState({
    title: '',
    category: 'NEUROSCIENCE',
    level: 1,
    contentText: '',
    status: 'published',
    durationMinutes: 5,
    rewardPoints: 50
  });

  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    type: 'individual',
    rewardPoints: 50,
    durationDays: 7,
    startDate: new Date().toISOString().split('T')[0],
    active: true
  });

  const [expertForm, setExpertForm] = useState({
    name: '',
    title: '',
    specialty: 'urologie',
    bio: '',
    isActive: true
  });

  // Fetch functions
  const fetchLessons = useCallback(async (catFilter?: string, query?: string) => {
    setIsLoading(true);
    try {
      let url = `/api/admin/content/lessons?`;
      if (catFilter && catFilter !== 'all') url += `category=${encodeURIComponent(catFilter)}&`;
      if (query) url += `q=${encodeURIComponent(query)}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur réseau lors de la récupération des leçons');
      const data = await res.json();
      setLessons(data);
    } catch (err: any) {
      addToast('error', err.message || 'Impossible de récupérer les leçons');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchChallenges = useCallback(async (typeFilter?: string, query?: string) => {
    setIsLoading(true);
    try {
      let url = `/api/admin/content/challenges?`;
      if (typeFilter && typeFilter !== 'all') url += `type=${encodeURIComponent(typeFilter)}&`;
      if (query) url += `q=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur réseau lors de la récupération des défis');
      const data = await res.json();
      setChallenges(data);
    } catch (err: any) {
      addToast('error', err.message || 'Impossible de récupérer les défis');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchExperts = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      let url = `/api/admin/content/experts?`;
      if (query) url += `q=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur réseau lors de la récupération des experts');
      const data = await res.json();
      setExperts(data);
    } catch (err: any) {
      addToast('error', err.message || 'Impossible de récupérer les experts');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Load active tab data
  useEffect(() => {
    if (activeTab === 'lessons') {
      fetchLessons(activeCategoryFilter, searchQuery);
    } else if (activeTab === 'challenges') {
      fetchChallenges(activeTypeFilter, searchQuery);
    } else if (activeTab === 'experts') {
      fetchExperts(searchQuery);
    }
    setDeleteConfirmId(null);
  }, [activeTab, activeCategoryFilter, activeTypeFilter, searchQuery, fetchLessons, fetchChallenges, fetchExperts]);

  // Handle Quick Toggle (Publish/Unpublish or Active/Inactive)
  const handleQuickToggle = async (id: string, currentStatus: boolean | string, type: 'lesson' | 'challenge' | 'expert') => {
    try {
      let res;
      if (type === 'lesson') {
        const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
        res = await fetch(`/api/admin/content/lessons/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) {
          addToast('success', `Statut de la leçon mis à jour en : ${nextStatus === 'published' ? 'PUBLIÉE 🟢' : 'BROUILLON ⚪'}`);
          fetchLessons(activeCategoryFilter, searchQuery);
        }
      } else if (type === 'challenge') {
        res = await fetch(`/api/admin/content/challenges/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: !currentStatus })
        });
        if (res.ok) {
          addToast('success', `Statut du défi mis à jour en : ${!currentStatus ? 'ACTIF 🟢' : 'INACTIF ⚪'}`);
          fetchChallenges(activeTypeFilter, searchQuery);
        }
      } else if (type === 'expert') {
        res = await fetch(`/api/admin/content/experts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !currentStatus })
        });
        if (res.ok) {
          addToast('success', `Expert mis à jour : ${!currentStatus ? 'VISIBLE EN LIVE 🟢' : 'MASQUÉ ⚪'}`);
          fetchExperts(searchQuery);
        }
      }
    } catch (err) {
      addToast('error', 'Erreur lors de la mise à jour rapide du statut');
    }
  };

  // Delete Action
  const handleDeleteItem = async (id: string) => {
    try {
      let url = '';
      if (activeTab === 'lessons') url = `/api/admin/content/lessons/${id}`;
      else if (activeTab === 'challenges') url = `/api/admin/content/challenges/${id}`;
      else if (activeTab === 'experts') url = `/api/admin/content/experts/${id}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Échec de la suppression');

      addToast('success', 'Élément supprimé avec succès ! 🗑️');
      setDeleteConfirmId(null);

      if (activeTab === 'lessons') fetchLessons(activeCategoryFilter, searchQuery);
      else if (activeTab === 'challenges') fetchChallenges(activeTypeFilter, searchQuery);
      else if (activeTab === 'experts') fetchExperts(searchQuery);
    } catch (err: any) {
      addToast('error', err.message || 'Une erreur est survenue lors de la suppression');
    }
  };

  // Open creation modal
  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingItemId(null);
    
    if (activeTab === 'lessons') {
      setLessonForm({
        title: '',
        category: 'NEUROSCIENCE',
        level: 1,
        contentText: '',
        status: 'published',
        durationMinutes: 5,
        rewardPoints: 50
      });
    } else if (activeTab === 'challenges') {
      setChallengeForm({
        title: '',
        description: '',
        type: 'individual',
        rewardPoints: 50,
        durationDays: 7,
        startDate: new Date().toISOString().split('T')[0],
        active: true
      });
    } else if (activeTab === 'experts') {
      setExpertForm({
        name: '',
        title: '',
        specialty: 'urologie',
        bio: '',
        isActive: true
      });
    }
    setIsFormOpen(true);
  };

  // Open editing modal
  const handleOpenEdit = (item: any) => {
    setFormMode('edit');
    setEditingItemId(item.id);

    if (activeTab === 'lessons') {
      setLessonForm({
        title: item.title,
        category: item.category,
        level: item.level,
        contentText: item.content && item.content[1] ? item.content[1].text : '',
        status: item.status || 'published',
        durationMinutes: item.durationMinutes || 5,
        rewardPoints: item.rewardPoints || 50
      });
    } else if (activeTab === 'challenges') {
      setChallengeForm({
        title: item.title,
        description: item.description,
        type: item.type,
        rewardPoints: item.rewardPoints,
        durationDays: item.durationDays,
        startDate: item.startDate ? item.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        active: item.active
      });
    } else if (activeTab === 'experts') {
      setExpertForm({
        name: item.name,
        title: item.title,
        specialty: item.specialty,
        bio: item.bio,
        isActive: item.isActive
      });
    }
    setIsFormOpen(true);
  };

  // Handle Form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = '';
      let method = 'POST';
      let body: any = {};

      if (activeTab === 'lessons') {
        if (!lessonForm.title.trim()) {
          addToast('warning', 'Le titre de la leçon est obligatoire.');
          return;
        }
        url = formMode === 'create' ? '/api/admin/content/lessons' : `/api/admin/content/lessons/${editingItemId}`;
        method = formMode === 'create' ? 'POST' : 'PUT';
        body = lessonForm;
      } else if (activeTab === 'challenges') {
        if (!challengeForm.title.trim() || !challengeForm.description.trim()) {
          addToast('warning', 'Le titre et la description du défi sont obligatoires.');
          return;
        }
        url = formMode === 'create' ? '/api/admin/content/challenges' : `/api/admin/content/challenges/${editingItemId}`;
        method = formMode === 'create' ? 'POST' : 'PUT';
        body = challengeForm;
      } else if (activeTab === 'experts') {
        if (!expertForm.name.trim() || !expertForm.title.trim() || !expertForm.bio.trim()) {
          addToast('warning', 'Le nom, le titre et la bio sont obligatoires.');
          return;
        }
        url = formMode === 'create' ? '/api/admin/content/experts' : `/api/admin/content/experts/${editingItemId}`;
        method = formMode === 'create' ? 'POST' : 'PUT';
        body = expertForm;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Échec de l'enregistrement");

      addToast('success', formMode === 'create' ? 'Élément créé avec succès ! 🎉' : 'Élément modifié avec succès ! 🛡️');
      setIsFormOpen(false);

      if (activeTab === 'lessons') fetchLessons(activeCategoryFilter, searchQuery);
      else if (activeTab === 'challenges') fetchChallenges(activeTypeFilter, searchQuery);
      else if (activeTab === 'experts') fetchExperts(searchQuery);

    } catch (err: any) {
      addToast('error', err.message || "Erreur d'enregistrement");
    }
  };

  // Visual Category helper mapping
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'NEUROSCIENCE':
        return { bg: 'rgba(74, 144, 217, 0.15)', text: '#4A90D9', label: 'Neuroscience' };
      case 'PATTERN_ADDICTION':
        return { bg: 'rgba(255, 149, 0, 0.15)', text: '#FF9500', label: 'Addiction' };
      case 'KEGEL_PHYSIOLOGY':
        return { bg: 'rgba(0, 217, 165, 0.15)', text: '#00D9A5', label: 'Kegel' };
      case 'VITALITY_ENERGY':
        return { bg: 'rgba(255, 45, 85, 0.15)', text: '#FF2D55', label: 'Vitalité' };
      case 'CONFIDENCE_INTIMACY':
        return { bg: 'rgba(175, 82, 222, 0.15)', text: '#AF52DE', label: 'Intimité' };
      default:
        return { bg: 'rgba(142, 142, 147, 0.15)', text: '#8E8E93', label: 'Général' };
    }
  };

  // Specialty mapping
  const getSpecialtyColor = (spec: string) => {
    switch (spec) {
      case 'sexologie':
        return { bg: 'rgba(175, 82, 222, 0.15)', text: '#AF52DE', label: 'Sexologie' };
      case 'urologie':
        return { bg: 'rgba(0, 217, 165, 0.15)', text: '#00D9A5', label: 'Urologie' };
      case 'psychiatrie':
        return { bg: 'rgba(74, 144, 217, 0.15)', text: '#4A90D9', label: 'Psychiatrie' };
      case 'nutrition':
        return { bg: 'rgba(255, 149, 0, 0.15)', text: '#FF9500', label: 'Nutrition' };
      case 'andrologie':
        return { bg: 'rgba(255, 45, 85, 0.15)', text: '#FF2D55', label: 'Andrologie' };
      default:
        return { bg: 'rgba(142, 142, 147, 0.15)', text: '#8E8E93', label: spec };
    }
  };

  // Initial letters
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div id="content_management_container" className="min-h-screen bg-[#09090E] text-[#FFFFFF] font-sans">
      
      {/* HEADER */}
      <header id="content_mgmt_header" className="bg-[#0F0F1A] border-b border-[#1A1A2E] px-8 py-5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            id="back_to_admin_btn"
            onClick={onBack}
            className="p-2 bg-[#16213E] hover:bg-[#1f305e] rounded-lg transition-colors text-[#8E8E93] hover:text-[#FFFFFF]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] text-[#FFD700] tracking-widest font-mono block">ESPACE CONTRÔLE</span>
            <h1 className="text-xl font-bold font-sans tracking-tight text-[#FFFFFF]">
              GESTION DE CONTENU
            </h1>
          </div>
        </div>
        <div className="bg-[#FFD700]/10 px-3 py-1 rounded-full border border-[#FFD700]/20 hidden sm:block">
          <span className="text-[11px] font-semibold text-[#FFD700] tracking-wider uppercase font-mono">
            Mode Éditeur Actif
          </span>
        </div>
      </header>

      {/* TABS CONTAINER */}
      <div id="tabs_outer" className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div id="content_mgmt_tabs" className="flex bg-[#1A1A2E] p-1 rounded-xl">
          <button
            id="tab_lessons"
            onClick={() => { setActiveTab('lessons'); setSearchQuery(''); }}
            className={`flex-1 py-3 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'lessons' 
                ? 'bg-[#FFD700] text-[#0F0F1A]' 
                : 'bg-transparent text-[#8E8E93] hover:text-[#FFFFFF]'
            }`}
          >
            <GraduationCap size={16} />
            <span>LEÇONS ({lessons.length})</span>
          </button>
          
          <button
            id="tab_challenges"
            onClick={() => { setActiveTab('challenges'); setSearchQuery(''); }}
            className={`flex-1 py-3 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'challenges' 
                ? 'bg-[#FFD700] text-[#0F0F1A]' 
                : 'bg-transparent text-[#8E8E93] hover:text-[#FFFFFF]'
            }`}
          >
            <Award size={16} />
            <span>DÉFIS ({challenges.length})</span>
          </button>

          <button
            id="tab_experts"
            onClick={() => { setActiveTab('experts'); setSearchQuery(''); }}
            className={`flex-1 py-3 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'experts' 
                ? 'bg-[#FFD700] text-[#0F0F1A]' 
                : 'bg-transparent text-[#8E8E93] hover:text-[#FFFFFF]'
            }`}
          >
            <User size={16} />
            <span>EXPERTS ({experts.length})</span>
          </button>
        </div>
      </div>

      {/* ACTIONS BAR */}
      <div id="actions_bar" className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div id="search_field_wrapper" className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]">
            <Search size={16} />
          </span>
          <input
            id="search_input"
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16213E] text-[#FFFFFF] rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none border border-transparent focus:border-[#FFD700]/40 transition-all font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#FFFFFF] text-xs font-mono"
            >
              Vider
            </button>
          )}
        </div>

        {/* Create Button */}
        <button
          id="btn_new_item"
          onClick={handleOpenCreate}
          className="w-full sm:w-auto bg-[#FFD700] text-[#0F0F1A] hover:bg-[#ffe34d] font-sans font-bold text-xs rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10 transition-colors"
        >
          <Plus size={16} />
          <span className="uppercase">
            {activeTab === 'lessons' ? 'Nouvelle Leçon' : activeTab === 'challenges' ? 'Nouveau Défi' : 'Nouvel Expert'}
          </span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main id="content_mgmt_main_stage" className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        
        <AnimatePresence mode="wait">
          {/* =================== LESSONS TAB =================== */}
          {activeTab === 'lessons' && (
            <motion.div
              key="lessons_tab_view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              id="stage_lessons"
            >
              {/* Category Filters Chips */}
              <div id="category_chips" className="flex flex-wrap gap-2 mt-6">
                {['all', 'Neuroscience', 'Addiction', 'Physiologie Kegel', 'Vitalité', 'Confiance & Intimité'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      activeCategoryFilter === cat
                        ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40'
                        : 'bg-[#16213E]/60 text-[#8E8E93] border border-transparent hover:border-[#1A1A2E] hover:text-[#FFFFFF]'
                    }`}
                  >
                    {cat === 'all' ? 'TOUTES' : cat}
                  </button>
                ))}
              </div>

              {/* List */}
              <div id="lessons_list" className="mt-6 space-y-2">
                {isLoading && lessons.length === 0 ? (
                  <div className="py-20 text-center text-[#8E8E93] text-sm">Chargement du curriculum...</div>
                ) : lessons.length === 0 ? (
                  <div className="py-20 text-center bg-[#16213E]/30 rounded-xl border border-[#1A1A2E]">
                    <p className="text-[#8E8E93] text-sm">Aucune leçon ne correspond à cette recherche.</p>
                  </div>
                ) : (
                  lessons.map((lesson, idx) => {
                    const catTheme = getCategoryColor(lesson.category);
                    const isPublished = lesson.status === 'published';
                    
                    return (
                      <div
                        key={lesson.id}
                        id={`lesson-row-${lesson.id}`}
                        onClick={() => handleOpenEdit(lesson)}
                        className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#16213E] hover:bg-[#1d2d54] rounded-xl cursor-pointer transition-colors border border-[#1A1A2E]/50"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Order index */}
                          <span className="font-mono text-sm font-bold text-[#8E8E93] w-8">
                            {lesson.level || (idx + 1)}
                          </span>
                          
                          {/* Category Badge */}
                          <div 
                            style={{ backgroundColor: catTheme.bg, color: catTheme.text }}
                            className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-center shrink-0 w-[130px]"
                          >
                            {catTheme.label}
                          </div>

                          {/* Lesson Details */}
                          <div className="min-w-0 ml-1">
                            <h3 className="text-sm font-semibold text-[#FFFFFF] group-hover:text-[#FFD700] transition-colors truncate">
                              {lesson.title}
                            </h3>
                            <p className="text-[11px] text-[#8E8E93] truncate">
                              {lesson.durationMinutes || 5} min · +{lesson.rewardPoints || 50} PTS
                            </p>
                          </div>
                        </div>

                        {/* Status badge & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-3 mt-3 md:mt-0 pt-3 md:pt-0 border-t border-[#1A1A2E] md:border-t-0">
                          {/* Status */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickToggle(lesson.id, lesson.status, 'lesson');
                            }}
                            className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider transition-colors ${
                              isPublished
                                ? 'bg-emerald-500/10 text-[#00D9A5] hover:bg-emerald-500/20'
                                : 'bg-[#8E8E93]/10 text-[#8E8E93] hover:bg-[#8E8E93]/20'
                            }`}
                          >
                            {isPublished ? 'PUBLIÉE' : 'BROUILLON'}
                          </button>

                          {/* Action tools */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(lesson);
                              }}
                              className="p-1.5 text-[#8E8E93] hover:text-[#FFD700] hover:bg-[#0F0F1A] rounded transition-all"
                              title="Modifier la leçon"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickToggle(lesson.id, lesson.status, 'lesson');
                              }}
                              className="p-1.5 text-[#8E8E93] hover:text-[#FFFFFF] hover:bg-[#0F0F1A] rounded transition-all"
                              title={isPublished ? "Passer en brouillon" : "Publier"}
                            >
                              {isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>

                            {/* Delete handling */}
                            {deleteConfirmId === lesson.id ? (
                              <div className="flex items-center gap-1 bg-[#2C141D] rounded p-0.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(lesson.id);
                                  }}
                                  className="px-2 py-1 text-[10px] font-bold text-[#FF2D55] hover:bg-[#FF2D55]/20 rounded transition-colors"
                                >
                                  Confirmer
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(null);
                                  }}
                                  className="p-1 text-[#8E8E93] hover:text-white"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(lesson.id);
                                }}
                                className="p-1.5 text-[#8E8E93] hover:text-[#FF2D55] hover:bg-[#FF2D55]/10 rounded transition-all"
                                title="Supprimer la leçon"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* =================== CHALLENGES TAB =================== */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges_tab_view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              id="stage_challenges"
            >
              {/* Type Filter Chips */}
              <div id="type_chips" className="flex gap-2 mt-6">
                {[
                  { key: 'all', label: 'TOUS' },
                  { key: 'individual', label: 'Individuels' },
                  { key: 'clan', label: 'Clan' }
                ].map(type => (
                  <button
                    key={type.key}
                    onClick={() => setActiveTypeFilter(type.key)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      activeTypeFilter === type.key
                        ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40'
                        : 'bg-[#16213E]/60 text-[#8E8E93] border border-transparent hover:border-[#1A1A2E] hover:text-[#FFFFFF]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div id="challenges_grid" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading && challenges.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-[#8E8E93] text-sm">Chargement des quêtes...</div>
                ) : challenges.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-[#16213E]/30 rounded-xl border border-[#1A1A2E]">
                    <p className="text-[#8E8E93] text-sm">Aucun défi disponible pour le moment.</p>
                  </div>
                ) : (
                  challenges.map((challenge) => {
                    const isClan = challenge.type === 'clan';
                    return (
                      <div
                        key={challenge.id}
                        id={`challenge-card-${challenge.id}`}
                        onClick={() => handleOpenEdit(challenge)}
                        className="bg-[#16213E] p-5 rounded-2xl border border-[#1A1A2E]/50 hover:border-[#FFD700]/20 transition-all flex flex-col justify-between cursor-pointer group"
                      >
                        <div>
                          {/* Upper Card Head */}
                          <div className="flex items-start justify-between">
                            <span className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase ${
                              isClan 
                                ? 'bg-indigo-500/10 text-indigo-400' 
                                : 'bg-[#FFD700]/10 text-[#FFD700]'
                            }`}>
                              {isClan ? 'CLAN 🛡️' : 'INDIVIDUEL 👤'}
                            </span>

                            {/* Active/Inactive Switch Toggle */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickToggle(challenge.id, challenge.active, 'challenge');
                              }}
                              className={`w-10 h-6 rounded-full p-1 transition-colors relative ${
                                challenge.active ? 'bg-[#FFD700]' : 'bg-[#5A5A5A]'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-[#0F0F1A] rounded-full transition-transform absolute top-1 ${
                                challenge.active ? 'right-1' : 'left-1'
                              }`} />
                            </button>
                          </div>

                          <h3 className="text-md font-bold mt-3 text-[#FFFFFF] group-hover:text-[#FFD700] transition-colors font-sans">
                            {challenge.title}
                          </h3>
                          
                          <p className="text-xs text-[#8E8E93] mt-2 line-clamp-2 leading-relaxed">
                            {challenge.description}
                          </p>
                        </div>

                        {/* Footer details */}
                        <div className="mt-5 pt-4 border-t border-[#1A1A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 text-[10px] text-[#8E8E93]">
                            <span className="flex items-center gap-1">
                              <Award size={12} className="text-[#FFD700]" />
                              {challenge.rewardPoints || 50} PTS
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {challenge.durationDays || 7} jours
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {(challenge.id === 'chall-1') ? '128' : (challenge.id === 'chall-2') ? '432' : '45'} part.
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(challenge);
                              }}
                              className="p-1.5 text-[#8E8E93] hover:text-[#FFD700] rounded hover:bg-[#0F0F1A] transition-all"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete handling */}
                            {deleteConfirmId === challenge.id ? (
                              <div className="flex items-center gap-1 bg-[#2C141D] rounded p-0.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(challenge.id);
                                  }}
                                  className="px-2 py-0.5 text-[9px] font-bold text-[#FF2D55] hover:bg-[#FF2D55]/20 rounded transition-colors"
                                >
                                  Supprimer
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(null);
                                  }}
                                  className="p-1 text-[#8E8E93] hover:text-white"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(challenge.id);
                                }}
                                className="p-1.5 text-[#8E8E93] hover:text-[#FF2D55] rounded hover:bg-[#FF2D55]/10 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* =================== EXPERTS TAB =================== */}
          {activeTab === 'experts' && (
            <motion.div
              key="experts_tab_view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              id="stage_experts"
            >
              {/* Grid */}
              <div id="experts_grid" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading && experts.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-[#8E8E93] text-sm">Chargement du corps d'experts médical...</div>
                ) : experts.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-[#16213E]/30 rounded-xl border border-[#1A1A2E]">
                    <p className="text-[#8E8E93] text-sm">Aucun expert enregistré.</p>
                  </div>
                ) : (
                  experts.map((expert) => {
                    const specTheme = getSpecialtyColor(expert.specialty);
                    return (
                      <div
                        key={expert.id}
                        id={`expert-card-${expert.id}`}
                        onClick={() => handleOpenEdit(expert)}
                        className="bg-[#16213E] p-6 rounded-2xl border border-[#1A1A2E]/50 hover:border-[#FFD700]/20 transition-all flex flex-col items-center cursor-pointer group relative"
                      >
                        {/* Upper Active Toggle badge on absolute right-3 */}
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickToggle(expert.id, expert.isActive, 'expert');
                            }}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
                              expert.isActive ? 'bg-[#FFD700]' : 'bg-[#5A5A5A]'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 bg-[#0F0F1A] rounded-full transition-transform absolute top-0.5 ${
                              expert.isActive ? 'right-0.5' : 'left-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Avatar 56px with initials */}
                        <div 
                          style={{ borderColor: specTheme.text }}
                          className="w-14 h-14 rounded-full border-2 bg-[#0F0F1A] flex items-center justify-center text-md font-bold font-mono tracking-wider shrink-0 mt-2"
                        >
                          <span style={{ color: specTheme.text }}>
                            {getInitials(expert.name)}
                          </span>
                        </div>

                        {/* Details */}
                        <h3 className="text-sm font-bold text-center mt-3 text-[#FFFFFF] group-hover:text-[#FFD700] transition-colors truncate w-full">
                          {expert.name}
                        </h3>

                        <p className="text-[11px] text-[#8E8E93] text-center mt-1 font-medium truncate w-full px-2">
                          {expert.title}
                        </p>

                        <div 
                          style={{ backgroundColor: specTheme.bg, color: specTheme.text }}
                          className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-3"
                        >
                          {specTheme.label}
                        </div>

                        {/* Sessions Stats */}
                        <p className="text-[10px] text-[#8E8E93] text-center mt-4 border-t border-[#1A1A2E] pt-4 w-full">
                          {expert.sessionCount || 0} sessions données · {expert.questionCount || 0} questions
                        </p>

                        {/* Expert Actions */}
                        <div className="mt-4 flex items-center justify-center gap-2 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(expert);
                            }}
                            className="text-xs bg-[#1A1A2E] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0F0F1A] font-sans font-semibold py-1 px-3 rounded-lg transition-all"
                          >
                            Éditer Profil
                          </button>

                          {deleteConfirmId === expert.id ? (
                            <div className="flex items-center gap-1 bg-[#2C141D] rounded p-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(expert.id);
                                }}
                                className="px-2 py-0.5 text-[9px] font-bold text-[#FF2D55] hover:bg-[#FF2D55]/20 rounded"
                              >
                                Virer
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="p-0.5 text-[#8E8E93]"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(expert.id);
                              }}
                              className="p-1.5 text-[#8E8E93] hover:text-[#FF2D55] rounded hover:bg-[#FF2D55]/10"
                              title="Révoquer l'expert"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FORM MODAL WITH SLIDE UP + FADEIN */}
      <AnimatePresence>
        {isFormOpen && (
          <div id="form_modal_backdrop" className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              id="form_modal_body"
              className="bg-[#0F0F1A] border border-[#1A1A2E] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Head */}
              <div className="p-5 border-b border-[#1A1A2E] flex items-center justify-between bg-[#131322]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-[#FFD700] rounded" />
                  <h2 className="text-md font-bold font-sans text-[#FFFFFF] tracking-tight uppercase">
                    {formMode === 'create' ? 'CRÉER' : 'MODIFIER'} :{' '}
                    {activeTab === 'lessons' ? 'Leçon Éducative' : activeTab === 'challenges' ? 'Défi Quotidien' : 'Profil Expert'}
                  </h2>
                </div>
                <button
                  id="close_modal_btn"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 bg-[#16213E] hover:bg-[#1f305e] rounded-lg text-[#8E8E93] hover:text-[#FFFFFF] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form elements Scroll Area */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* 1. LESSON FORM FIELDS */}
                {activeTab === 'lessons' && (
                  <div id="fields_lesson" className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Titre de la leçon *</label>
                      <input
                        type="text"
                        required
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="Ex: Le circuit dopaminergique de la récompense"
                        className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Catégorie *</label>
                        <select
                          value={lessonForm.category}
                          onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-3 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        >
                          <option value="NEUROSCIENCE">Neuroscience Fondamentale</option>
                          <option value="PATTERN_ADDICTION">Addiction & Habitudes</option>
                          <option value="KEGEL_PHYSIOLOGY">Physiologie Kegel</option>
                          <option value="VITALITY_ENERGY">Vitalité & Énergie</option>
                          <option value="CONFIDENCE_INTIMACY">Confiance & Intimité</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Ordre / Niveau *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={lessonForm.level}
                          onChange={(e) => setLessonForm({ ...lessonForm, level: Number(e.target.value) })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Durée (minutes)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={lessonForm.durationMinutes}
                          onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Points de récompense</label>
                        <input
                          type="number"
                          min="10"
                          max="1000"
                          required
                          value={lessonForm.rewardPoints}
                          onChange={(e) => setLessonForm({ ...lessonForm, rewardPoints: Number(e.target.value) })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Statut de publication</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setLessonForm({ ...lessonForm, status: 'published' })}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              lessonForm.status === 'published'
                                ? 'bg-emerald-500/10 text-[#00D9A5] border-[#00D9A5]/50'
                                : 'bg-[#16213E] text-[#8E8E93] border-transparent'
                            }`}
                          >
                            PUBLIÉE
                          </button>
                          <button
                            type="button"
                            onClick={() => setLessonForm({ ...lessonForm, status: 'draft' })}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              lessonForm.status === 'draft'
                                ? 'bg-neutral-500/10 text-[#8E8E93] border-[#8E8E93]/50'
                                : 'bg-[#16213E] text-[#8E8E93] border-transparent'
                            }`}
                          >
                            BROUILLON
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Contenu éditorial principal *</label>
                      <textarea
                        rows={8}
                        required
                        value={lessonForm.contentText}
                        onChange={(e) => setLessonForm({ ...lessonForm, contentText: e.target.value })}
                        placeholder="Insérez le texte complet de la leçon..."
                        className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-3 text-xs outline-none text-[#FFFFFF] transition-all resize-none font-sans leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 2. CHALLENGE FORM FIELDS */}
                {activeTab === 'challenges' && (
                  <div id="fields_challenge" className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Titre du défi *</label>
                      <input
                        type="text"
                        required
                        value={challengeForm.title}
                        onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                        placeholder="Ex: Douche Glacée d'Acier"
                        className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Description *</label>
                      <textarea
                        rows={4}
                        required
                        value={challengeForm.description}
                        onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                        placeholder="Détails du défi et instructions de complétion..."
                        className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-3 text-xs outline-none text-[#FFFFFF] transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Portée / Type</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setChallengeForm({ ...challengeForm, type: 'individual' })}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              challengeForm.type === 'individual'
                                ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30'
                                : 'bg-[#16213E] text-[#8E8E93] border-transparent'
                            }`}
                          >
                            INDIVIDUEL
                          </button>
                          <button
                            type="button"
                            onClick={() => setChallengeForm({ ...challengeForm, type: 'clan' })}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              challengeForm.type === 'clan'
                                ? 'bg-indigo-500/10 text-indigo-400' + ' border-indigo-500/30'
                                : 'bg-[#16213E] text-[#8E8E93] border-transparent'
                            }`}
                          >
                            CLAN
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Points de récompense *</label>
                        <input
                          type="number"
                          min="5"
                          required
                          value={challengeForm.rewardPoints}
                          onChange={(e) => setChallengeForm({ ...challengeForm, rewardPoints: Number(e.target.value) })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Durée (jours)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={challengeForm.durationDays}
                          onChange={(e) => setChallengeForm({ ...challengeForm, durationDays: Number(e.target.value) })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Date de début</label>
                        <input
                          type="date"
                          required
                          value={challengeForm.startDate}
                          onChange={(e) => setChallengeForm({ ...challengeForm, startDate: e.target.value })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-3 py-2 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Statut Actif</label>
                        <button
                          type="button"
                          onClick={() => setChallengeForm({ ...challengeForm, active: !challengeForm.active })}
                          className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
                            challengeForm.active
                              ? 'bg-emerald-500/10 text-[#00D9A5] border-[#00D9A5]/40'
                              : 'bg-neutral-500/10 text-[#8E8E93] border-[#8E8E93]/20'
                          }`}
                        >
                          {challengeForm.active ? 'ACTIF (En cours)' : 'INACTIF (Archivé)'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EXPERT FORM FIELDS */}
                {activeTab === 'experts' && (
                  <div id="fields_expert" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Nom complet *</label>
                        <input
                          type="text"
                          required
                          value={expertForm.name}
                          onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })}
                          placeholder="Ex: Dr. Marc-Antoine Perrin"
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Titre professionnel *</label>
                        <input
                          type="text"
                          required
                          value={expertForm.title}
                          onChange={(e) => setExpertForm({ ...expertForm, title: e.target.value })}
                          placeholder="Ex: Sexologue clinicien & Andrologue"
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Spécialité *</label>
                        <select
                          value={expertForm.specialty}
                          onChange={(e) => setExpertForm({ ...expertForm, specialty: e.target.value })}
                          className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-3 py-2.5 text-xs outline-none text-[#FFFFFF] transition-all"
                        >
                          <option value="sexologie">Sexologie</option>
                          <option value="urologie">Urologie</option>
                          <option value="psychiatrie">Psychiatrie & Neuro-Psychologie</option>
                          <option value="nutrition">Nutrition & Hormonologie</option>
                          <option value="andrologie">Andrologie</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Statut de visibilité</label>
                        <button
                          type="button"
                          onClick={() => setExpertForm({ ...expertForm, isActive: !expertForm.isActive })}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            expertForm.isActive
                              ? 'bg-emerald-500/10 text-[#00D9A5] border-[#00D9A5]/40'
                              : 'bg-neutral-500/10 text-[#8E8E93] border-[#8E8E93]/20'
                          }`}
                        >
                          {expertForm.isActive ? 'VISIBLE EN LIVE' : 'MASQUÉ / RETRAITÉ'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">Biographie médicale / Bio courte *</label>
                      <textarea
                        rows={5}
                        required
                        value={expertForm.bio}
                        onChange={(e) => setExpertForm({ ...expertForm, bio: e.target.value })}
                        placeholder="Présentation des diplômes, orientations de recherche et accompagnement..."
                        className="w-full bg-[#16213E] border border-transparent focus:border-[#FFD700]/30 rounded-xl px-4 py-3 text-xs outline-none text-[#FFFFFF] transition-all resize-none font-sans"
                      />
                    </div>
                  </div>
                )}

              </form>

              {/* Modal footer Actions */}
              <div className="p-4 border-t border-[#1A1A2E] flex items-center justify-end gap-3 bg-[#131322]">
                <button
                  type="button"
                  id="cancel_form_btn"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8E8E93] hover:text-white hover:bg-[#16213E] transition-all"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  id="submit_form_btn"
                  onClick={handleFormSubmit}
                  className="bg-[#FFD700] text-[#0F0F1A] hover:bg-[#ffe34d] px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all"
                >
                  Enregistrer
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
