import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Brain, 
  Dumbbell, 
  Zap, 
  Target, 
  Moon, 
  Sun, 
  Apple, 
  Snowflake, 
  Wind, 
  Star, 
  Flame, 
  Shield, 
  Bell, 
  Check, 
  Crown 
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';
import { AlphaCard } from '../../components/AlphaCard';

interface TokensTabProps {
  setActiveTab: (tab: any) => void;
}

export const TokensTab: React.FC<TokensTabProps> = ({ setActiveTab }) => {
  return (
    <div className="flex flex-col gap-8 animate-[fade-in_0.3s_ease-out] text-left">
      <div className="tokens-banner p-6 bg-gradient-to-r from-[#16213E] to-[#1A1A2E] rounded-3xl border border-[#E94560]/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-headline font-bold uppercase tracking-widest">
            Fidélité Absolue
          </span>
          <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-white mt-3 tracking-wide">
            Des Fondations Rigoureuses pour le Leader Moderne
          </h2>
          <p className="text-sm text-[#8E8E93] mt-2 leading-relaxed flex flex-wrap items-center gap-y-2">
            L'ADN d'ALPHA MAN réside dans le contraste tranché entre le noir absolu du combat
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0F0F1A] border border-[#1A1A2E]/30 text-xs font-mono font-bold text-white ml-1.5 mr-1 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block shrink-0" style={{ backgroundColor: '#0F0F1A' }} />
              Combat (#0F0F1A)
            </span>,
            le rouge de l'urgence
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#E94560]/10 border border-[#E94560]/20 text-xs font-mono font-bold text-[#E94560] ml-1.5 mr-1 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: '#E94560' }} />
              Urgence (#E94560)
            </span> et
            l'or de la récompense
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FFD700]/10 border border-[#FFD700]/20 text-xs font-mono font-bold text-[#FFD700] ml-1.5 mr-1 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: '#FFD700' }} />
              Récompense (#FFD700)
            </span>. Pas de faux-semblant : l'immersion est absolue.
          </p>
        </div>
        <div className="flex gap-4">
          <AlphaButton variant="secondary" onClick={() => setActiveTab('playground')}>
            Entrer dans le Lab Components
          </AlphaButton>
        </div>
      </div>

      {/* Visual Tokens Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Palette Couleurs */}
        <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E94560] animate-ping" />
            <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">Palette de Couleurs</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { name: 'Primary (Deep Navy)', hex: '#1A1A2E', desc: 'Confiance, profondeur, structure interne', textColor: 'text-white' },
              { name: 'Secondary (Alpha Red)', hex: '#E94560', desc: 'Énergie, action radicale, urgence vitale', textColor: 'text-white' },
              { name: 'Accent (Gold Premium)', hex: '#FFD700', desc: 'Récompense, excellence, élite', textColor: 'text-black' },
              { name: 'Background (Dark Void)', hex: '#0F0F1A', desc: 'Focus absolu, immunité visuelle nocturne', textColor: 'text-white' },
              { name: 'Surface (Elevated)', hex: '#16213E', desc: 'Cartes, widgets, hiérarchie de profondeur', textColor: 'text-white' },
              { name: 'Success (Growth Green)', hex: '#00D9A5', desc: 'Progression, virilité positive, kegel validé', textColor: 'text-black' },
              { name: 'Error (Relapse Red)', hex: '#FF2D55', desc: 'Alerte, relâchement, relapse instantanée', textColor: 'text-white' },
            ].map((color, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#0F0F1A]/50 border border-[#16213E]">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg border border-white/10 shrink-0" 
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-xs font-headline font-bold text-white">{color.name}</p>
                    <p className="text-[10px] text-[#8E8E93]">{color.desc}</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#8E8E93] bg-[#16213E] px-2 py-1 rounded">
                  {color.hex}
                </span>
              </div>
            ))}
          </div>
        </AlphaCard>

        {/* Typographie & Grid */}
        <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">Typographies & Grid</h3>
          </div>
          <div className="flex flex-col gap-4">
            {/* Font pairing */}
            <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
              <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Headline Font</span>
              <p className="font-headline font-extrabold text-2xl text-white">Montserrat Bold</p>
              <p className="text-xs text-[#8E8E93]">Pour les titres de défi, statuts majeurs et marques de prestige.</p>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
              <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Body Font</span>
              <p className="font-body font-medium text-sm text-white">Inter Regular & Medium</p>
              <p className="text-xs text-[#8E8E93]">Optimisé pour une lisibilité maximale à toutes les échelles.</p>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
              <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Data / Numbers</span>
              <p className="font-mono font-bold text-2xl text-[#FFD700]">Roboto Mono (48px, 36px)</p>
              <p className="text-xs text-[#8E8E93]">Pour l'affichage de chronomètres, scores et séries (streak).</p>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
              <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Langues Arabes Future</span>
              <p className="font-headline text-lg text-[#00D9A5]" style={{ fontFamily: 'Noto Sans Arabic' }}>
                الفا مان - Noto Sans Arabic
              </p>
              <p className="text-xs text-[#8E8E93]">Prêt pour la mondialisation du wellness masculin.</p>
            </div>
          </div>
        </AlphaCard>

        {/* Spacings & Shadows */}
        <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">Spacings, Radius & Shadows</h3>
          </div>
          <div className="flex flex-col gap-4">
            {/* Grid 8px visualization */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Grille d'espacement (8px Grid)</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'xs', val: '4px' },
                  { name: 'sm', val: '8px' },
                  { name: 'md', val: '16px' },
                  { name: 'lg', val: '24px' },
                ].map((sp, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-[#0F0F1A] border border-[#16213E] p-2 rounded-lg">
                    <span className="text-[10px] font-mono font-bold text-white">{sp.name}</span>
                    <span className="text-[9px] text-[#8E8E93]">{sp.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radiuses */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Radius Systèmes</span>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between p-2 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                  <span className="text-[#8E8E93]">Cartes / Widgets</span>
                  <span className="font-mono font-bold text-white">16px</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                  <span className="text-[#8E8E93]">Boutons (Primary)</span>
                  <span className="font-mono font-bold text-white">12px</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                  <span className="text-[#8E8E93]">Champs de Saisie</span>
                  <span className="font-mono font-bold text-white">12px</span>
                </div>
              </div>
            </div>

            {/* Shadows and Glows */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Glows & Ombres Spécifiées</span>
              <div className="flex flex-col gap-2">
                <div className="h-8 rounded-xl bg-[#16213E] flex items-center justify-center text-xs shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Level 1 Shadow (2px offset)
                </div>
                <div className="h-8 rounded-xl bg-[#16213E] flex items-center justify-center text-xs shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  Level 2 Shadow (4px offset)
                </div>
                <div className="h-8 rounded-xl bg-[#16213E] flex items-center justify-center text-xs shadow-[0_0_20px_rgba(0,217,165,0.35)]">
                  Glow Success Green
                </div>
              </div>
            </div>
          </div>
        </AlphaCard>
      </div>

      {/* Icons Inventory */}
      <AlphaCard variant="default" className="p-6">
        <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3 mb-4">
          <Sparkles className="w-4 h-4 text-[#FFD700]" />
          <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">
            Identité Iconographique (Line, 2px stroke, rounded caps)
          </h3>
        </div>
        <p className="text-xs text-[#8E8E93] mb-6 leading-relaxed">
          Chaque module d'ALPHA MAN possède son propre symbole de force. Ces icônes constituent les repères visuels pour l'activation neuronale et physique.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { icon: <Brain className="w-6 h-6" />, name: 'Mind / Cerveau', color: 'text-blue-400' },
            { icon: <Dumbbell className="w-6 h-6" />, name: 'Body / Muscle', color: 'text-red-400' },
            { icon: <Zap className="w-6 h-6 text-[#E94560]" />, name: 'Energy / Vitalité', color: 'text-amber-400' },
            { icon: <Target className="w-6 h-6 text-[#E94560]" />, name: 'Kegel / Focus', color: 'text-[#E94560]' },
            { icon: <Moon className="w-6 h-6 text-purple-400" />, name: 'Sleep / Sommeil', color: 'text-purple-400' },
            { icon: <Sun className="w-6 h-6 text-yellow-400" />, name: 'Sun / Rythme', color: 'text-yellow-400' },
            { icon: <Apple className="w-6 h-6 text-[#00D9A5]" />, name: 'Nutrition / Pomme', color: 'text-emerald-400' },
            { icon: <Snowflake className="w-6 h-6 text-sky-400" />, name: 'Cold / Douche froide', color: 'text-sky-400' },
            { icon: <Wind className="w-6 h-6" />, name: 'Breath / Respiration', color: 'text-teal-400' },
            { icon: <Star className="w-6 h-6 text-[#FFD700]" />, name: 'Points / Score', color: 'text-[#FFD700]' },
            { icon: <Flame className="w-6 h-6 text-orange-500 fill-current" />, name: 'Streak / Série', color: 'text-orange-500' },
            { icon: <Shield className="w-6 h-6 text-[#FFD700] fill-current" />, name: 'Clan / Fraternité', color: 'text-yellow-500' },
            { icon: <Bell className="w-6 h-6 text-orange-400" />, name: 'Alert / Rappels', color: 'text-orange-400' },
            { icon: <Check className="w-6 h-6 text-[#00D9A5]" />, name: 'Success / Progrès', color: 'text-[#00D9A5]' },
            { icon: <Crown className="w-6 h-6 text-[#FFD700] fill-current" />, name: 'Premium / Crown', color: 'text-[#FFD700]' },
          ].map((ic, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4 bg-[#0F0F1A] border border-[#16213E] rounded-2xl hover:border-[#E94560]/30 transition-all duration-200">
              <div className="mb-2 p-2 bg-[#16213E] rounded-xl">
                {ic.icon}
              </div>
              <span className="text-xs font-headline font-bold text-white text-center">{ic.name.split('/')[0]}</span>
              <span className="text-[9px] text-[#5A5A5A] font-mono mt-1 text-center">{ic.name.split('/')[1]}</span>
            </div>
          ))}
        </div>
      </AlphaCard>
    </div>
  );
};
