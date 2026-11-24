import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import type { PortfolioDocument, TemplateId } from '../types/portfolio';

interface TemplatesViewProps {
  activeTemplate: TemplateId;
  portfolio: PortfolioDocument | null;
  onSelectTemplate: (templateId: TemplateId) => void;
  onTrySampleWithTemplate: (templateId: TemplateId) => void;
}

type CategoryFilter = 'all' | 'light' | 'dark' | 'split';

const TEMPLATES: {
  id: TemplateId;
  name: string;
  category: 'light' | 'dark' | 'split';
  subtitle: string;
  typography: string;
  bestFor: string;
  description: string;
}[] = [
  {
    id: 'editorial',
    name: 'Editorial Monograph',
    category: 'light',
    subtitle: 'Warm Paper · Serif Display · Case Studies',
    typography: 'Fraunces + Plus Jakarta Sans',
    bestFor: 'Frontend & Design Engineers',
    description:
      'Generous whitespace, numbered 01–06 repository case studies, and an architectural split hero.',
  },
  {
    id: 'terminal',
    name: 'Systems & Terminal Grid',
    category: 'dark',
    subtitle: 'Dark Graphite · Monospace · Telemetry',
    typography: 'JetBrains Mono + Plus Jakarta Sans',
    bestFor: 'Backend, DevOps & API Engineers',
    description:
      'Built around GitHub telemetry, proportional language bars, and a dense 2-column repo matrix.',
  },
  {
    id: 'bento',
    name: 'Swiss Bento Showcase',
    category: 'light',
    subtitle: 'Modular Grid · Spotlight Card · Crisp White',
    typography: 'Outfit + Plus Jakarta Sans',
    bestFor: 'Full-Stack Juniors & Builders',
    description:
      'Asymmetric Swiss Bento tiles highlight a flagship build alongside GitHub activity metrics.',
  },
  {
    id: 'architect',
    name: 'Nordic Architectural Split',
    category: 'split',
    subtitle: 'Sticky Left Dossier · Filterable Index',
    typography: 'Outfit + JetBrains Mono',
    bestFor: 'Full-Stack & Software Architects',
    description:
      'Persistent left developer dossier with language bars and a filterable engineering index.',
  },
  {
    id: 'spotlight',
    name: 'Obsidian Editorial Studio',
    category: 'dark',
    subtitle: 'Obsidian Dark · Serif Contrast · Flagship',
    typography: 'Fraunces + Plus Jakarta Sans',
    bestFor: 'Creative Technologists',
    description:
      'High-contrast obsidian canvas pairing serif headlines with a flagship repository spotlight.',
  },
  {
    id: 'blueprint',
    name: 'Engineering Resume',
    category: 'light',
    subtitle: 'Recruiter Spec Sheet · Clean Section Rows',
    typography: 'Outfit + JetBrains Mono',
    bestFor: 'Internships & Junior Job Apps',
    description:
      'Structured recruiter-friendly resume layout organizing summary, skills, and chronological repos.',
  },
  {
    id: 'minimal',
    name: 'Minimalist Essay',
    category: 'light',
    subtitle: 'Single-Column Reader · Zero Clutter',
    typography: 'Outfit + Plus Jakarta Sans',
    bestFor: 'Open-Source Authors & Writers',
    description:
      'Focused single-column homepage prioritizing clear prose, project links, and scannability.',
  },
  {
    id: 'matrix',
    name: 'Git Log CLI',
    category: 'dark',
    subtitle: 'Commit-Stream Layout · Monospace Native',
    typography: 'JetBrains Mono + Plus Jakarta Sans',
    bestFor: 'CLI, Linux & Systems Juniors',
    description:
      'Git commit log aesthetic displaying ranked repositories as commits alongside language JSON.',
  },
  {
    id: 'newspaper',
    name: 'Dev Broadsheet',
    category: 'light',
    subtitle: 'Archival Print · 3-Column Gazette',
    typography: 'Fraunces + JetBrains Mono',
    bestFor: 'Technical Storytellers & Generalists',
    description:
      'Classic multi-column editorial broadsheet with masthead, GitHub ledger, and 3-column repo feed.',
  },
  {
    id: 'slate',
    name: 'Midnight Cobalt',
    category: 'dark',
    subtitle: 'Deep Navy · Elevated Panels · 3-Col Builds',
    typography: 'Outfit + JetBrains Mono',
    bestFor: 'Product & SaaS Engineers',
    description:
      'Deep navy-slate canvas with structured hero telemetry and a 3-column featured builds grid.',
  },
  {
    id: 'cards',
    name: 'Modular Stack Deck',
    category: 'light',
    subtitle: 'Language Color Bars · 4-KPI Scorecard',
    typography: 'Outfit + Plus Jakarta Sans',
    bestFor: 'Bootcamp & CS Graduates',
    description:
      'Clean 3-column repository cards topped by language accent bars and a top GitHub scorecard.',
  },
  {
    id: 'splitdark',
    name: 'Carbon Split Studio',
    category: 'split',
    subtitle: 'Dark Rail Sidebar · Bright White Canvas',
    typography: 'Outfit + JetBrains Mono',
    bestFor: 'Modern Full-Stack Portfolios',
    description:
      'High-contrast split pairing a dark obsidian profile sidebar with a bright white project grid.',
  },
];

const TemplateMiniPreview: React.FC<{
  templateId: TemplateId;
  name: string;
  headline: string;
  repos: string[];
}> = ({ templateId, name, headline, repos }) => {
  if (templateId === 'terminal' || templateId === 'matrix' || templateId === 'slate') {
    const bg =
      templateId === 'matrix'
        ? 'bg-[#06090F] border-slate-800'
        : templateId === 'slate'
          ? 'bg-[#090D16] border-slate-800'
          : 'bg-[#0B0F17] border-slate-800';
    const accentText =
      templateId === 'matrix'
        ? 'text-emerald-400'
        : templateId === 'slate'
          ? 'text-sky-400'
          : 'text-blue-400';

    return (
      <div className={`h-40 rounded-xl border ${bg} p-3.5 flex flex-col justify-between text-slate-100`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono-tabular text-[10px]">
          <span className="text-white font-semibold truncate">{name}</span>
          <span className={accentText}>{templateId}</span>
        </div>
        <div className="font-display text-xs font-bold text-white line-clamp-2 my-auto">
          {headline}
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono-tabular text-[10px] text-slate-300">
          <div className="rounded border border-slate-800 bg-slate-900/80 p-1.5 truncate">
            {repos[0] || 'api-core'}
          </div>
          <div className="rounded border border-slate-800 bg-slate-900/80 p-1.5 truncate">
            {repos[1] || 'cli-tool'}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'spotlight') {
    return (
      <div className="h-40 rounded-xl border border-zinc-800 bg-[#09090B] p-3.5 flex flex-col justify-between text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
          <span className="font-editorial text-xs font-semibold text-white truncate">{name}</span>
          <span className="text-[10px] text-amber-400">Studio</span>
        </div>
        <div className="font-editorial text-xs font-semibold text-white line-clamp-2 my-auto">
          {headline}
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[10px] text-zinc-300 truncate">
          01 · {repos[0] || 'flagship-app'}
        </div>
      </div>
    );
  }

  if (templateId === 'architect' || templateId === 'splitdark') {
    const isDarkRail = templateId === 'splitdark';
    return (
      <div className="h-40 rounded-xl border border-slate-200 bg-white grid grid-cols-12 overflow-hidden">
        <div
          className={`col-span-4 p-2.5 flex flex-col justify-between ${
            isDarkRail
              ? 'bg-[#111114] text-white'
              : 'bg-slate-50 border-r border-slate-200 text-slate-900'
          }`}
        >
          <div className="font-display text-[10px] font-bold truncate">{name}</div>
          <div className="text-[9px] opacity-70">Sidebar</div>
        </div>
        <div className="col-span-8 p-2.5 flex flex-col justify-between">
          <div className="font-display text-[11px] font-bold text-slate-900 line-clamp-2">
            {headline}
          </div>
          <div className="border-t border-slate-200 pt-1.5 text-[10px] text-slate-700 truncate">
            01 · {repos[0] || 'core-platform'}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'newspaper') {
    return (
      <div className="h-40 rounded-xl border border-stone-300 bg-[#F7F5F0] p-3.5 flex flex-col justify-between text-stone-900">
        <div className="border-b-2 border-stone-900 pb-1.5 flex justify-between items-baseline">
          <span className="font-editorial text-xs font-bold truncate">{name}</span>
          <span className="font-mono-tabular text-[9px] text-stone-600">Gazette</span>
        </div>
        <div className="font-editorial text-xs font-semibold line-clamp-2 my-auto">
          {headline}
        </div>
        <div className="grid grid-cols-3 gap-1.5 border-t border-stone-300 pt-1.5 text-[9px] text-stone-700">
          <div className="truncate">{repos[0] || 'repo-1'}</div>
          <div className="truncate">{repos[1] || 'repo-2'}</div>
          <div className="truncate">repo-3</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-40 rounded-xl border p-3.5 flex flex-col justify-between ${
        templateId === 'editorial'
          ? 'border-stone-200 bg-[#FAF9F6]'
          : templateId === 'cards'
            ? 'border-slate-200 bg-slate-100'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
        <span className="font-display text-xs font-bold text-slate-900 truncate">{name}</span>
        <span className="font-mono-tabular text-[9px] text-blue-600">{templateId}</span>
      </div>
      <div className="font-display text-xs font-bold text-slate-900 line-clamp-2 my-auto">
        {headline}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
        <div className="rounded border border-slate-200 bg-white px-2 py-1 truncate">
          {repos[0] || 'web-app'}
        </div>
        <div className="rounded border border-slate-200 bg-white px-2 py-1 truncate">
          {repos[1] || 'api-server'}
        </div>
      </div>
    </div>
  );
};

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  activeTemplate,
  portfolio,
  onSelectTemplate,
  onTrySampleWithTemplate,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const previewName = portfolio?.profile.name || 'Junior Engineer';
  const previewHeadline =
    portfolio?.aiContent.headline ||
    'Building reliable full-stack applications & developer tools';
  const previewRepos = portfolio?.topRepos.map((r) => r.name) || [
    'commerce-api',
    'react-studio',
  ];

  const filteredTemplates =
    filter === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mb-2">
            12 Portfolio Templates
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every template transforms your real GitHub profile into a distinct typography pairing,
            color system, and project grid—ready for live editing and HTML export.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              { id: 'all', label: 'All (12)' },
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
              { id: 'split', label: 'Split Rail' },
            ] as { id: CategoryFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTemplates.map((tpl) => {
          const isCurrent = activeTemplate === tpl.id;
          return (
            <article
              key={tpl.id}
              className={`rounded-2xl border bg-white overflow-hidden flex flex-col justify-between transition-colors ${
                isCurrent ? 'border-blue-600' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
                  <TemplateMiniPreview
                    templateId={tpl.id}
                    name={previewName}
                    headline={previewHeadline}
                    repos={previewRepos}
                  />
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">{tpl.subtitle}</div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {tpl.name}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tpl.description}
                  </p>

                  <dl className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px]">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Typography</dt>
                      <dd className="font-medium text-slate-900 text-right">
                        {tpl.typography}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Best For</dt>
                      <dd className="font-medium text-slate-900 text-right">
                        {tpl.bestFor}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id)}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isCurrent && <Check className="w-3.5 h-3.5" />}
                  {portfolio
                    ? isCurrent
                      ? 'Active in Studio (Open)'
                      : 'Switch to This Template'
                    : 'Select Template'}
                </button>

                {!portfolio && (
                  <button
                    type="button"
                    onClick={() => onTrySampleWithTemplate(tpl.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Demo with @gaearon
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
