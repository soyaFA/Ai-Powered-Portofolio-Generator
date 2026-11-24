import React from 'react';
import { ArrowUpRight, Download, FolderOpen, Lock, Trash2 } from 'lucide-react';
import type { AuthUser, PortfolioDocument } from '../types/portfolio';

interface SavedViewProps {
  authUser: AuthUser | null;
  portfolios: PortfolioDocument[];
  isLoading: boolean;
  onOpenAuthModal: () => void;
  onOpenPortfolio: (doc: PortfolioDocument) => void;
  onExportPortfolio: (doc: PortfolioDocument) => void;
  onDeletePortfolio: (id: string) => void;
  onGoToStudio: () => void;
}

const TEMPLATE_LABELS: Record<string, string> = {
  editorial: 'Editorial Monograph',
  terminal: 'Systems Terminal',
  bento: 'Swiss Bento',
  architect: 'Nordic Sidebar',
  spotlight: 'Obsidian Studio',
  blueprint: 'Engineering Resume',
  minimal: 'Minimalist Essay',
  matrix: 'Git Log CLI',
  newspaper: 'Dev Broadsheet',
  slate: 'Midnight Cobalt',
  cards: 'Modular Deck',
  splitdark: 'Carbon Split',
};

export const SavedView: React.FC<SavedViewProps> = ({
  authUser,
  portfolios,
  isLoading,
  onOpenAuthModal,
  onOpenPortfolio,
  onExportPortfolio,
  onDeletePortfolio,
  onGoToStudio,
}) => {
  if (!authUser) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center space-y-5">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Sign in to view your saved portfolios
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in or create an account to save, edit, and reopen your portfolio versions.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              Sign In / Create Account
            </button>
            <button
              type="button"
              onClick={onGoToStudio}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              Back to Studio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Saved Portfolios
          </h1>
          <p className="text-sm text-slate-600">
            Account workspace for <strong className="text-slate-900">{authUser.name}</strong> (
            {authUser.email}).
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToStudio}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
        >
          Analyze New Username
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-52 rounded-xl border border-slate-200 bg-white animate-pulse p-6"
            />
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center max-w-xl mx-auto">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-2">
            No saved portfolios in your account yet
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Analyze a GitHub username in the Studio, choose a template, and click Save to keep it
            here.
          </p>
          <button
            type="button"
            onClick={onGoToStudio}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            Open Portfolio Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolios.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.profile.avatarUrl}
                      alt={item.profile.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-bold text-slate-900 truncate">
                        {item.profile.name}
                      </h2>
                      <div className="font-mono-tabular text-xs text-slate-500 truncate">
                        @{item.username}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-2">
                  {TEMPLATE_LABELS[item.templateId] || item.templateId} · {item.careerTrack}
                </div>

                <p className="text-sm font-medium text-slate-900 line-clamp-2 mb-3">
                  {item.aiContent.headline}
                </p>

                <div className="text-xs font-mono-tabular text-slate-500">
                  {item.topRepos.length} projects · {item.activity.totalStars} stars · Updated{' '}
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenPortfolio(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Open
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onExportPortfolio(item)}
                    aria-label={`Export ${item.username} HTML`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    HTML
                  </button>
                  <a
                    href={item.profile.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.username} GitHub`}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDeletePortfolio(item.id)}
                    aria-label={`Delete ${item.username} portfolio`}
                    className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
