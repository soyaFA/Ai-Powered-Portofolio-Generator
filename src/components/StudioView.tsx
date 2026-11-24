import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Database,
  Download,
  ExternalLink,
  FolderKanban,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  PenLine,
  RefreshCw,
  Save,
  Smartphone,
  UserCheck,
  Wand2,
} from 'lucide-react';
import type { AuthUser, PortfolioDocument, TemplateId } from '../types/portfolio';
import { EditorialTemplate } from './templates/EditorialTemplate';
import { TerminalTemplate } from './templates/TerminalTemplate';
import { BentoTemplate } from './templates/BentoTemplate';
import { ArchitectTemplate } from './templates/ArchitectTemplate';
import { SpotlightTemplate } from './templates/SpotlightTemplate';
import { BlueprintTemplate } from './templates/BlueprintTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { MatrixTemplate } from './templates/MatrixTemplate';
import { NewspaperTemplate } from './templates/NewspaperTemplate';
import { SlateTemplate } from './templates/SlateTemplate';
import { CardsTemplate } from './templates/CardsTemplate';
import { SplitDarkTemplate } from './templates/SplitDarkTemplate';
import { ContentEditorPanel } from './ContentEditorPanel';

interface StudioViewProps {
  portfolio: PortfolioDocument | null;
  preferredTemplate: TemplateId;
  authUser: AuthUser | null;
  savedCount: number;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  aiErrorMessage: string | null;
  saveFeedback: string | null;
  onSelectPreferredTemplate: (templateId: TemplateId) => void;
  onAnalyzeUsername: (username: string, templateId: TemplateId) => void;
  onOptimizeAI: () => void;
  onChangePortfolio: (updated: PortfolioDocument) => void;
  onSavePortfolio: () => void;
  onExportHtml: () => void;
  onResetStudio: () => void;
  onOpenAuthModal: () => void;
  onNavigateToTemplates: () => void;
  onNavigateToSaved: () => void;
}

interface TemplateOption {
  id: TemplateId;
  label: string;
  tone: string;
  surface: 'light' | 'dark' | 'split';
  accent: string;
  fontClass: string;
  previewBg: string;
  previewText: string;
  previewMuted: string;
  previewBorder: string;
  previewCardBg: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'editorial',
    label: 'Editorial Monograph',
    tone: 'Light Serif',
    surface: 'light',
    accent: '#0F172A',
    fontClass: 'font-serif',
    previewBg: 'bg-[#FAF9F6]',
    previewText: 'text-slate-900',
    previewMuted: 'text-slate-600',
    previewBorder: 'border-slate-200',
    previewCardBg: 'bg-white',
  },
  {
    id: 'terminal',
    label: 'Systems Terminal',
    tone: 'Dark Mono',
    surface: 'dark',
    accent: '#10B981',
    fontClass: 'font-mono-tabular',
    previewBg: 'bg-[#0B0F17]',
    previewText: 'text-slate-100',
    previewMuted: 'text-slate-400',
    previewBorder: 'border-slate-800',
    previewCardBg: 'bg-[#111827]',
  },
  {
    id: 'bento',
    label: 'Swiss Bento',
    tone: 'Modular Grid',
    surface: 'light',
    accent: '#2563EB',
    fontClass: 'font-display',
    previewBg: 'bg-slate-50',
    previewText: 'text-slate-900',
    previewMuted: 'text-slate-600',
    previewBorder: 'border-slate-200',
    previewCardBg: 'bg-white',
  },
  {
    id: 'architect',
    label: 'Nordic Sidebar',
    tone: 'Light Split',
    surface: 'split',
    accent: '#2563EB',
    fontClass: 'font-display',
    previewBg: 'bg-white',
    previewText: 'text-slate-900',
    previewMuted: 'text-slate-600',
    previewBorder: 'border-slate-200',
    previewCardBg: 'bg-slate-50',
  },
  {
    id: 'spotlight',
    label: 'Obsidian Studio',
    tone: 'Dark Serif',
    surface: 'dark',
    accent: '#D97706',
    fontClass: 'font-serif',
    previewBg: 'bg-[#121212]',
    previewText: 'text-stone-100',
    previewMuted: 'text-stone-400',
    previewBorder: 'border-stone-800',
    previewCardBg: 'bg-[#1A1A1A]',
  },
  {
    id: 'blueprint',
    label: 'Engineering Resume',
    tone: 'CV Spec',
    surface: 'light',
    accent: '#2563EB',
    fontClass: 'font-sans',
    previewBg: 'bg-white',
    previewText: 'text-slate-900',
    previewMuted: 'text-slate-600',
    previewBorder: 'border-blue-200',
    previewCardBg: 'bg-blue-50/40',
  },
  {
    id: 'minimal',
    label: 'Minimalist Essay',
    tone: 'Single Col',
    surface: 'light',
    accent: '#0F172A',
    fontClass: 'font-sans',
    previewBg: 'bg-white',
    previewText: 'text-slate-900',
    previewMuted: 'text-slate-500',
    previewBorder: 'border-slate-200',
    previewCardBg: 'bg-slate-50/70',
  },
  {
    id: 'matrix',
    label: 'Git Log CLI',
    tone: 'CLI Dark',
    surface: 'dark',
    accent: '#10B981',
    fontClass: 'font-mono-tabular',
    previewBg: 'bg-black',
    previewText: 'text-emerald-300',
    previewMuted: 'text-emerald-500/80',
    previewBorder: 'border-emerald-900/70',
    previewCardBg: 'bg-zinc-950',
  },
  {
    id: 'newspaper',
    label: 'Dev Broadsheet',
    tone: 'Gazette',
    surface: 'light',
    accent: '#0F172A',
    fontClass: 'font-serif',
    previewBg: 'bg-[#F5F2EB]',
    previewText: 'text-stone-900',
    previewMuted: 'text-stone-600',
    previewBorder: 'border-stone-300',
    previewCardBg: 'bg-[#FAF8F3]',
  },
  {
    id: 'slate',
    label: 'Midnight Cobalt',
    tone: 'Navy Dark',
    surface: 'dark',
    accent: '#0284C7',
    fontClass: 'font-display',
    previewBg: 'bg-[#0F172A]',
    previewText: 'text-slate-100',
    previewMuted: 'text-slate-400',
    previewBorder: 'border-slate-800',
    previewCardBg: 'bg-[#1E293B]',
  },
  {
    id: 'cards',
    label: 'Modular Deck',
    tone: '3-Col Deck',
    surface: 'light',
    accent: '#2563EB',
    fontClass: 'font-display',
    previewBg: 'bg-slate-100',
    previewText: 'text-slate-900',
    previewMuted: 'text-slate-600',
    previewBorder: 'border-slate-200',
    previewCardBg: 'bg-white',
  },
  {
    id: 'splitdark',
    label: 'Carbon Split',
    tone: 'Dark Rail',
    surface: 'split',
    accent: '#0284C7',
    fontClass: 'font-display',
    previewBg: 'bg-[#111318]',
    previewText: 'text-zinc-100',
    previewMuted: 'text-zinc-400',
    previewBorder: 'border-zinc-800',
    previewCardBg: 'bg-[#181B22]',
  },
];

const ACCENT_SWATCHES = [
  { label: 'Cobalt', value: '#2563EB' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Crimson', value: '#E11D48' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Sky', value: '#0284C7' },
  { label: 'Ink Slate', value: '#0F172A' },
];

const SAMPLE_PROFILES = ['gaearon', 'sindresorhus', 'addyosmani', 'tj'];

export const StudioView: React.FC<StudioViewProps> = ({
  portfolio,
  preferredTemplate,
  authUser,
  savedCount,
  isAnalyzing,
  isOptimizing,
  isSaving,
  errorMessage,
  aiErrorMessage,
  saveFeedback,
  onSelectPreferredTemplate,
  onAnalyzeUsername,
  onOptimizeAI,
  onChangePortfolio,
  onSavePortfolio,
  onExportHtml,
  onResetStudio,
  onOpenAuthModal,
  onNavigateToTemplates,
  onNavigateToSaved,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onAnalyzeUsername(usernameInput.trim(), preferredTemplate);
  };

  const renderActiveTemplate = (doc: PortfolioDocument) => {
    switch (doc.templateId) {
      case 'editorial':
        return <EditorialTemplate portfolio={doc} />;
      case 'terminal':
        return <TerminalTemplate portfolio={doc} />;
      case 'bento':
        return <BentoTemplate portfolio={doc} />;
      case 'architect':
        return <ArchitectTemplate portfolio={doc} />;
      case 'spotlight':
        return <SpotlightTemplate portfolio={doc} />;
      case 'blueprint':
        return <BlueprintTemplate portfolio={doc} />;
      case 'minimal':
        return <MinimalTemplate portfolio={doc} />;
      case 'matrix':
        return <MatrixTemplate portfolio={doc} />;
      case 'newspaper':
        return <NewspaperTemplate portfolio={doc} />;
      case 'slate':
        return <SlateTemplate portfolio={doc} />;
      case 'cards':
        return <CardsTemplate portfolio={doc} />;
      case 'splitdark':
        return <SplitDarkTemplate portfolio={doc} />;
      default:
        return <EditorialTemplate portfolio={doc} />;
    }
  };

  if (!portfolio) {
    const activePreviewTpl =
      TEMPLATE_OPTIONS.find((t) => t.id === preferredTemplate) ?? TEMPLATE_OPTIONS[0];

    return (
      <div className="bg-slate-50">
        {/* Hero Band: Asymmetric 12-Column Split */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Value Prop + Analyzer Input */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                Built for Junior Software Engineers · 12 Templates · HTML Export
              </div>

              <h1
                className="font-display font-bold tracking-tight text-slate-900 leading-[1.06] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)' }}
              >
                Turn your GitHub repos into a portfolio recruiters read.
              </h1>

              <p className="max-w-xl text-base text-slate-600 leading-relaxed">
                Enter your GitHub username. Repo2Folio analyzes your repositories, calculates
                recency-weighted languages, rewrites project notes into clear case studies, and
                saves your versions.
              </p>

              {/* Analyzer Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 max-w-xl">
                <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border border-slate-300 bg-white p-1.5 focus-within:border-blue-600 transition-colors">
                  <div className="flex flex-1 items-center pl-3">
                    <span className="font-mono-tabular text-sm text-slate-400 select-none shrink-0">
                      github.com/
                    </span>
                    <input
                      id="github-username-input"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      aria-label="GitHub username"
                      className="w-full bg-transparent px-1.5 py-2.5 text-sm font-mono-tabular font-medium text-slate-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing || !usernameInput.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze &amp; Build
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Real GitHub Sample Profiles */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                  <span>Try real GitHub profiles:</span>
                  {SAMPLE_PROFILES.map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => {
                        setUsernameInput(handle);
                        onAnalyzeUsername(handle, preferredTemplate);
                      }}
                      className="font-mono-tabular font-semibold text-slate-800 hover:text-blue-600 underline decoration-slate-300 underline-offset-4 cursor-pointer"
                    >
                      @{handle}
                    </button>
                  ))}
                </div>
              </form>

              {errorMessage && (
                <div
                  role="alert"
                  className="max-w-xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800"
                >
                  {errorMessage}
                </div>
              )}

              {/* Account Link Bar */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600 max-w-xl">
                {authUser ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Signed in as {authUser.name}
                    </span>
                    {authUser.githubUsername && (
                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={() => {
                          setUsernameInput(authUser.githubUsername || '');
                          onAnalyzeUsername(authUser.githubUsername || '', preferredTemplate);
                        }}
                        className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer"
                      >
                        Analyze my GitHub (@{authUser.githubUsername})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onNavigateToSaved}
                      className="font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
                    >
                      View saved ({savedCount})
                    </button>
                  </>
                ) : (
                  <>
                    <span>Save custom edits &amp; multiple versions to your account.</span>
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer"
                    >
                      Sign in or create account
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Live Interactive Layout Preview Frame */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-4">
                {/* Browser Frame Header */}
                <div className="flex items-center justify-between gap-3 pb-3 px-1">
                  <div className="font-mono-tabular text-[11px] font-medium text-slate-500 truncate">
                    Live Layout Preview · {activePreviewTpl.label} ({activePreviewTpl.tone})
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToTemplates}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Browse all 12
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Rendered Template Architecture Preview */}
                <div
                  className={`rounded-xl border transition-colors duration-200 p-5 sm:p-6 space-y-5 ${activePreviewTpl.previewBg} ${activePreviewTpl.previewText} ${activePreviewTpl.previewBorder}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div
                        className="font-mono-tabular text-[11px] font-semibold"
                        style={{ color: activePreviewTpl.accent }}
                      >
                        @junior-engineer · Full-Stack Web Engineering
                      </div>
                      <div className={`text-xl font-bold leading-snug ${activePreviewTpl.fontClass}`}>
                        Full-Stack TypeScript &amp; MongoDB Developer
                      </div>
                      <p className={`text-xs leading-relaxed ${activePreviewTpl.previewMuted}`}>
                        Built 14 original repositories across Node.js, Express, React, and Docker
                        with verified README documentation.
                      </p>
                    </div>
                  </div>

                  {/* Mini Stack Strip */}
                  <div
                    className={`grid grid-cols-3 gap-2.5 border-y py-3 text-xs ${activePreviewTpl.previewBorder}`}
                  >
                    <div>
                      <div className={`text-[10px] uppercase tracking-wider ${activePreviewTpl.previewMuted}`}>
                        Core Stack
                      </div>
                      <div className="font-mono-tabular font-semibold mt-0.5 truncate">
                        TypeScript · JS
                      </div>
                    </div>
                    <div>
                      <div className={`text-[10px] uppercase tracking-wider ${activePreviewTpl.previewMuted}`}>
                        Original Repos
                      </div>
                      <div className="font-mono-tabular font-semibold mt-0.5">14 shipped</div>
                    </div>
                    <div>
                      <div className={`text-[10px] uppercase tracking-wider ${activePreviewTpl.previewMuted}`}>
                        Database
                      </div>
                      <div className="font-mono-tabular font-semibold mt-0.5 truncate">
                        MongoDB · Docker
                      </div>
                    </div>
                  </div>

                  {/* Mini Project Case Studies */}
                  <div
                    className={`grid gap-3 ${
                      activePreviewTpl.surface === 'split'
                        ? 'grid-cols-1'
                        : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    <div
                      className={`rounded-lg border p-3.5 space-y-1.5 ${activePreviewTpl.previewBorder} ${activePreviewTpl.previewCardBg}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-tabular text-xs font-bold truncate">
                          task-flow-api
                        </span>
                        <span
                          className="font-mono-tabular text-[10px] font-semibold"
                          style={{ color: activePreviewTpl.accent }}
                        >
                          TypeScript
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${activePreviewTpl.previewMuted}`}>
                        REST API with Express, Mongoose validation schemas, and containerized Redis
                        caching.
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border p-3.5 space-y-1.5 ${activePreviewTpl.previewBorder} ${activePreviewTpl.previewCardBg}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-tabular text-xs font-bold truncate">
                          devmetrics-ui
                        </span>
                        <span
                          className="font-mono-tabular text-[10px] font-semibold"
                          style={{ color: activePreviewTpl.accent }}
                        >
                          React · Vite
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${activePreviewTpl.previewMuted}`}>
                        Interactive repository telemetry dashboard with accessible keyboard
                        navigation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Container */}
        <div className="mx-auto max-w-[1440px] px-6 py-12 space-y-16">
          {/* Section 01: 12-Template Selector with Structural Swatches */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono-tabular text-xs font-semibold text-blue-600 mb-1">
                  01. Choose a Starting Architecture
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                  12 layouts built for engineering portfolios
                </h2>
              </div>
              <button
                type="button"
                onClick={onNavigateToTemplates}
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 underline underline-offset-4 cursor-pointer"
              >
                Inspect full template gallery
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {TEMPLATE_OPTIONS.map((tpl) => {
                const active = preferredTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onSelectPreferredTemplate(tpl.id)}
                    className={`rounded-xl border p-3 text-left transition-all cursor-pointer space-y-2.5 ${
                      active
                        ? 'border-blue-600 bg-white ring-2 ring-blue-600/15'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Mini Wireframe Swatch */}
                    <div
                      className={`h-11 rounded-lg border p-2 flex flex-col justify-between ${tpl.previewBg} ${tpl.previewBorder}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="h-1.5 w-8 rounded-xs"
                          style={{ backgroundColor: tpl.accent }}
                        />
                        <span className={`h-1.5 w-4 rounded-xs opacity-40 ${tpl.previewText} bg-current`} />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className={`h-2.5 rounded-xs border ${tpl.previewBorder} ${tpl.previewCardBg}`} />
                        <div className={`h-2.5 rounded-xs border ${tpl.previewBorder} ${tpl.previewCardBg}`} />
                      </div>
                    </div>

                    <div>
                      <div className="font-mono-tabular text-[11px] text-slate-500">
                        {tpl.tone}
                      </div>
                      <div className="font-display text-xs font-bold text-slate-900 truncate">
                        {tpl.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 02: Asymmetric Proof (Before/After + MongoDB Account Workspace) */}
          <section className="space-y-5">
            <div>
              <div className="font-mono-tabular text-xs font-semibold text-blue-600 mb-1">
                02. Real Engineering Evidence
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Grounded GitHub rewriting with private saved versions
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Col-Span 7: Before vs After */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Raw Repository vs. Portfolio Case Study
                  </h3>
                  <span className="font-mono-tabular text-xs text-slate-500">
                    GitHub REST + README Analysis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Before · Raw GitHub
                      </div>
                      <div className="font-mono-tabular text-sm font-bold text-slate-900">
                        task-manager-backend
                      </div>
                      <p className="font-mono-tabular text-xs text-slate-600 leading-relaxed">
                        &quot;final project using node express mongodb and docker compose for tasks&quot;
                      </p>
                    </div>
                    <div className="border-t border-slate-200 pt-3 font-mono-tabular text-[11px] text-slate-500">
                      TypeScript · 4 stars · pushed 2d ago
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-900 bg-[#0B0F17] text-slate-100 p-5 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                        After · Portfolio Output
                      </div>
                      <div className="font-display text-sm font-bold text-white">
                        task-manager-backend
                      </div>
                      <div className="text-xs font-semibold text-blue-400">
                        RESTful API with Mongoose &amp; Docker Compose
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Architected a typed Node.js and Express task service backed by MongoDB
                        schemas and multi-container Docker orchestration.
                      </p>
                    </div>
                    <div className="border-t border-slate-800 pt-3 font-mono-tabular text-[11px] text-slate-400">
                      Verified against package.json &amp; README
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col-Span 5: Saved Portfolio Workspace */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-slate-900">
                    <Database className="w-5 h-5 text-blue-600 shrink-0" />
                    <h3 className="font-display text-lg font-bold">
                      Private Portfolio Library
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Save tailored portfolio versions for different job applications and reopen or
                    edit them anytime from your account.
                  </p>

                  <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <FolderKanban className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        Keep separate Frontend, Backend, or Full-Stack drafts for the same GitHub
                        account.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Download className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        Export any saved snapshot as a standalone HTML5 file ready for GitHub Pages.
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {authUser ? (
                    <button
                      type="button"
                      onClick={onNavigateToSaved}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Open My Saved Portfolios ({savedCount})
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Create Free Account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Three-Stage Engineering Pipeline */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
              <div className="font-mono-tabular text-xs font-semibold text-blue-600">
                01. Deep GitHub Analysis
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Byte-Level Language &amp; Recency Scoring
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Inspects per-repo byte shares, excludes companion markup bias, reads README files,
                and scores original repositories by recency and stars.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
              <div className="font-mono-tabular text-xs font-semibold text-blue-600">
                02. Grounded Gemini Copy
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Fact-Checked Narrative Generation
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Drafts headlines, bios, and project highlights anchored strictly in your detected
                languages and README context—with instant inline editing.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
              <div className="font-mono-tabular text-xs font-semibold text-blue-600">
                03. Save &amp; Export HTML
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Account History &amp; Static Bundle
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Keep saved versions in your account or download a clean, zero-dependency HTML
                portfolio ready for GitHub Pages.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">{renderActiveTemplate(portfolio)}</div>
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-2 shadow-lg">
          <button
            type="button"
            onClick={onExportHtml}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export HTML
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Exit Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 space-y-5">
      {/* Studio Control Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        {/* Top Row: 12-Template Selector & Quick Accent Colors */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
            role="tablist"
            aria-label="Portfolio template selector"
          >
            {TEMPLATE_OPTIONS.map((tpl) => {
              const active = portfolio.templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    onChangePortfolio({ ...portfolio, templateId: tpl.id })
                  }
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500">Accent:</span>
            <div className="flex items-center gap-1.5">
              {ACCENT_SWATCHES.map((swatch) => {
                const active = portfolio.accentColor === swatch.value;
                return (
                  <button
                    key={swatch.value}
                    type="button"
                    title={swatch.label}
                    aria-label={`Set accent color to ${swatch.label}`}
                    onClick={() =>
                      onChangePortfolio({ ...portfolio, accentColor: swatch.value })
                    }
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      active ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.value }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row: AI Re-optimize + Preview/Save/Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isOptimizing}
              onClick={onOptimizeAI}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Optimizing with AI...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  Regenerate AI Copy
                </>
              )}
            </button>

            <span className="text-xs text-slate-500">
              Detected focus: <strong className="text-slate-800">{portfolio.careerTrack}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewWidth('desktop')}
                aria-label="Desktop preview"
                className={`rounded-md p-1.5 cursor-pointer ${
                  previewWidth === 'desktop'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewWidth('mobile')}
                aria-label="Mobile preview"
                className={`rounded-md p-1.5 cursor-pointer ${
                  previewWidth === 'mobile'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Fullscreen
            </button>

            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                isEditing
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              Edit Copy
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={onSavePortfolio}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveFeedback ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saveFeedback ? saveFeedback : authUser ? 'Save' : 'Sign In to Save'}
            </button>

            <button
              type="button"
              onClick={onExportHtml}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export HTML
            </button>

            <button
              type="button"
              onClick={onResetStudio}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Switch User
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Progress or Notice */}
      {isOptimizing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <span>
            Generating tailored headline, bio, and project impact summaries for{' '}
            <strong>@{portfolio.profile.login}</strong> based on their GitHub repositories...
          </span>
        </div>
      )}

      {aiErrorMessage && !isOptimizing && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3"
        >
          <span>
            {aiErrorMessage} Your portfolio is ready using your real GitHub data, and you can edit
            any text via Edit Copy.
          </span>
          <button
            type="button"
            onClick={onOptimizeAI}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry AI
          </button>
        </div>
      )}

      {/* Analyzed GitHub Summary Strip */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-slate-700">
            <span className="font-semibold text-slate-900">
              GitHub Analysis: @{portfolio.profile.login}
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-mono-tabular">
              {portfolio.activity.originalReposCount ?? portfolio.profile.publicRepos} original repos
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-mono-tabular">
              Core stack:{' '}
              <strong className="text-slate-900">
                {portfolio.activity.topLanguages && portfolio.activity.topLanguages.length > 0
                  ? portfolio.activity.topLanguages.join(' · ')
                  : portfolio.activity.primaryLanguage}
              </strong>
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-mono-tabular">
              {portfolio.activity.totalStars} stars
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-mono-tabular">
              {portfolio.activity.pushEventsCount} recent pushes
            </span>
          </div>

          <div className="text-slate-500 font-mono-tabular">
            Copy Source: {portfolio.aiContent.modelUsed}
          </div>
        </div>

        {portfolio.activity.detectedTechnologies &&
          portfolio.activity.detectedTechnologies.length > 0 && (
            <div className="border-t border-slate-100 pt-2 text-slate-600">
              <span className="font-semibold text-slate-800">Detected from repos &amp; READMEs: </span>
              <span className="font-mono-tabular">
                {portfolio.activity.detectedTechnologies.join(' · ')}
              </span>
            </div>
          )}
      </div>

      {/* Inline Editor Panel */}
      {isEditing && (
        <ContentEditorPanel
          portfolio={portfolio}
          onChange={onChangePortfolio}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Live Portfolio Canvas */}
      <div
        className={`mx-auto transition-all duration-200 ${
          previewWidth === 'mobile' ? 'max-w-[420px]' : 'w-full'
        }`}
      >
        {renderActiveTemplate(portfolio)}
      </div>
    </div>
  );
};
