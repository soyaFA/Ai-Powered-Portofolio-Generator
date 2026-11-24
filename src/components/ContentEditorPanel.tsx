import React from 'react';
import { X } from 'lucide-react';
import type { PortfolioDocument } from '../types/portfolio';

interface ContentEditorPanelProps {
  portfolio: PortfolioDocument;
  onChange: (updated: PortfolioDocument) => void;
  onClose: () => void;
}

const ACCENT_PRESETS = [
  { label: 'Cobalt', value: '#2563EB' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Crimson', value: '#E11D48' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Slate', value: '#0F172A' },
];

export const ContentEditorPanel: React.FC<ContentEditorPanelProps> = ({
  portfolio,
  onChange,
  onClose,
}) => {
  const updateAiField = (
    field: 'headline' | 'bio' | 'pitchSummary',
    value: string
  ) => {
    onChange({
      ...portfolio,
      aiContent: {
        ...portfolio.aiContent,
        [field]: value,
      },
    });
  };

  const updateSkills = (raw: string) => {
    const skills = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({
      ...portfolio,
      aiContent: {
        ...portfolio.aiContent,
        highlightedSkills: skills,
      },
    });
  };

  const updateRepoNarrative = (
    repoName: string,
    field: 'technicalHighlight' | 'impactSummary',
    value: string
  ) => {
    const existing = portfolio.aiContent.projectNarratives[repoName] ?? {
      repoName,
      technicalHighlight: '',
      impactSummary: '',
    };
    onChange({
      ...portfolio,
      aiContent: {
        ...portfolio.aiContent,
        projectNarratives: {
          ...portfolio.aiContent.projectNarratives,
          [repoName]: {
            ...existing,
            [field]: value,
          },
        },
      },
    });
  };

  return (
    <aside
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
      aria-label="Portfolio Content Editor"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Customize Portfolio Copy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Changes reflect immediately in the active template
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          aria-label="Close editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="editor-role"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Engineering Focus / Role Title
            </label>
            <input
              id="editor-role"
              type="text"
              value={portfolio.careerTrack}
              onChange={(e) =>
                onChange({ ...portfolio, careerTrack: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="editor-headline"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Hero Headline
            </label>
            <input
              id="editor-headline"
              type="text"
              value={portfolio.aiContent.headline}
              onChange={(e) => updateAiField('headline', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="editor-bio"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Professional Bio
            </label>
            <textarea
              id="editor-bio"
              rows={3}
              value={portfolio.aiContent.bio}
              onChange={(e) => updateAiField('bio', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="editor-pitch"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Engineering Philosophy
            </label>
            <input
              id="editor-pitch"
              type="text"
              value={portfolio.aiContent.pitchSummary}
              onChange={(e) => updateAiField('pitchSummary', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="editor-skills"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Highlighted Skills (comma-separated)
            </label>
            <input
              id="editor-skills"
              type="text"
              value={portfolio.aiContent.highlightedSkills.join(', ')}
              onChange={(e) => updateSkills(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="editor-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Contact Email
              </label>
              <input
                id="editor-email"
                type="email"
                value={portfolio.customEmail}
                onChange={(e) =>
                  onChange({ ...portfolio, customEmail: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                Availability Status
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...portfolio,
                    availableForHire: !portfolio.availableForHire,
                  })
                }
                className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                  portfolio.availableForHire
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {portfolio.availableForHire
                  ? 'Open to Opportunities'
                  : 'Portfolio Archive Mode'}
              </button>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Accent Color
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    onChange({ ...portfolio, accentColor: preset.value })
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    portfolio.accentColor === preset.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: preset.value }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Repository Summaries */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-xs font-semibold text-slate-700 mb-3">
          Project Case Study Copy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.topRepos.slice(0, 4).map((repo) => {
            const narrative = portfolio.aiContent.projectNarratives[repo.name];
            return (
              <div
                key={repo.id}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5"
              >
                <div className="text-xs font-semibold text-slate-900">
                  {repo.name}
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`repo-highlight-${repo.id}`}
                    className="block text-[11px] font-medium text-slate-500"
                  >
                    Technical Highlight
                  </label>
                  <input
                    id={`repo-highlight-${repo.id}`}
                    type="text"
                    value={narrative?.technicalHighlight ?? ''}
                    onChange={(e) =>
                      updateRepoNarrative(
                        repo.name,
                        'technicalHighlight',
                        e.target.value
                      )
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`repo-impact-${repo.id}`}
                    className="block text-[11px] font-medium text-slate-500"
                  >
                    Impact Summary
                  </label>
                  <textarea
                    id={`repo-impact-${repo.id}`}
                    rows={2}
                    value={narrative?.impactSummary ?? repo.description}
                    onChange={(e) =>
                      updateRepoNarrative(repo.name, 'impactSummary', e.target.value)
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
