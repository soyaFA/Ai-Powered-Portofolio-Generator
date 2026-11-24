import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const MatrixTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
  const {
    profile,
    topRepos,
    languages,
    activity,
    aiContent,
    careerTrack,
    accentColor,
    customEmail,
    availableForHire,
  } = portfolio;

  const cliAccent = accentColor === '#0F172A' ? '#10B981' : accentColor;

  return (
    <div className="bg-[#06090F] text-slate-200 border border-slate-800 rounded-xl overflow-hidden font-mono-tabular">
      {/* CLI Top Bar */}
      <div className="border-b border-slate-800 bg-[#0A0F1A] px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">git@{profile.login}</span>
          <span className="text-slate-600">:</span>
          <span style={{ color: cliAccent }}>~/portfolio</span>
        </div>
        <div className="flex items-center gap-5 text-slate-400">
          <span>{availableForHire ? 'status: open-to-work' : 'status: archive'}</span>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline inline-flex items-center gap-1"
          >
            github.com/{profile.login}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 sm:px-10 py-10 space-y-10">
        {/* Identity Command Block */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-800 pb-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs" style={{ color: cliAccent }}>
              $ whoami --track &quot;{careerTrack}&quot;
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug text-balance">
              {aiContent.headline}
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 font-sans max-w-2xl">
              {aiContent.bio}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
              {customEmail && (
                <a
                  href={`mailto:${customEmail}`}
                  style={{ backgroundColor: cliAccent }}
                  className="rounded-md px-4 py-2 font-semibold text-slate-950 hover:opacity-90"
                >
                  mailto:{customEmail}
                </a>
              )}
              <span className="text-slate-400">
                {profile.publicRepos} repos · {activity.totalStars} stars ·{' '}
                {activity.pushEventsCount} pushes
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-lg border border-slate-800 bg-[#0A0F1A] p-4 flex items-center gap-4">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-md object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0 space-y-1 text-xs">
              <div className="font-semibold text-white truncate">{profile.name}</div>
              <div className="text-slate-400 truncate">@{profile.login}</div>
              <div className="text-slate-500 truncate">
                {profile.location || 'Remote'} · {activity.accountYears}y
              </div>
            </div>
          </div>
        </section>

        {/* Git Log Style Repositories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: cliAccent }}>$ git log --top-repositories={topRepos.length}</span>
            <span className="text-slate-500">ordered by relevance_score</span>
          </div>

          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A0F1A]">
            {topRepos.map((repo, idx) => {
              const narrative = aiContent.projectNarratives[repo.name];
              const hash = `r${String(repo.id).slice(-5)}${idx}`;
              return (
                <article
                  key={repo.id}
                  className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
                >
                  <div className="md:col-span-3 space-y-1 text-xs">
                    <div style={{ color: cliAccent }}>{hash}</div>
                    <div className="text-slate-400">{formatRepoLanguages(repo)}</div>
                    <div className="text-slate-500">
                      ★ {repo.stars} · forks {repo.forks}
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-1.5">
                    <h2 className="text-base font-semibold text-white">{repo.name}</h2>
                    <div className="text-xs text-slate-300">
                      {narrative?.technicalHighlight || 'Repository Build'}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400 font-sans">
                      {narrative?.impactSummary || repo.description}
                    </p>
                  </div>

                  <div className="md:col-span-2 flex md:flex-col md:items-end gap-3 text-xs">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white hover:underline"
                    >
                      source
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        deploy
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Stack & Language Distribution */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="rounded-lg border border-slate-800 bg-[#0A0F1A] p-5 space-y-3">
            <div className="text-xs" style={{ color: cliAccent }}>
              $ cat languages.json
            </div>
            <div className="space-y-2.5">
              {languages.map((lang) => (
                <div key={lang.language} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-200">{lang.language}</span>
                    <span className="text-slate-400">
                      {lang.percentage}% ({lang.repoCount})
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0A0F1A] p-5 space-y-3">
            <div className="text-xs" style={{ color: cliAccent }}>
              $ cat capabilities.txt
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-sans">
              {aiContent.pitchSummary}
            </p>
            <div className="text-xs text-slate-200 leading-6 pt-2 border-t border-slate-800">
              {aiContent.highlightedSkills.join(' · ')}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
