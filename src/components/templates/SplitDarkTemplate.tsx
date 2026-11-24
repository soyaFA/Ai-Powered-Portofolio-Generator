import React from 'react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const SplitDarkTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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

  const railAccent = accentColor === '#0F172A' ? '#38BDF8' : accentColor;

  return (
    <div className="bg-white text-slate-900 border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
        {/* Dark Carbon Left Sidebar */}
        <aside className="lg:col-span-4 bg-[#111114] text-zinc-100 p-8 sm:p-10 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-zinc-700"
              />
              <div>
                <h1 className="font-display text-xl font-bold text-white">{profile.name}</h1>
                <div className="font-mono-tabular text-xs text-zinc-400">@{profile.login}</div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-5 space-y-2.5">
              <div className="text-xs font-semibold" style={{ color: railAccent }}>
                {careerTrack}
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">{aiContent.bio}</p>
              <div className="text-xs text-zinc-500 pt-1">
                {profile.location || 'Remote'} ·{' '}
                {availableForHire ? 'Open to Work' : 'Archive'}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-5 space-y-3">
              <h2 className="font-display text-xs font-bold text-zinc-300">Languages</h2>
              <div className="space-y-2">
                {languages.slice(0, 5).map((lang) => (
                  <div key={lang.language}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">{lang.language}</span>
                      <span className="font-mono-tabular text-zinc-500">{lang.percentage}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-5 flex flex-col gap-2.5">
            {customEmail && (
              <a
                href={`mailto:${customEmail}`}
                style={{ backgroundColor: railAccent }}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-zinc-950 hover:opacity-90"
              >
                <Mail className="w-3.5 h-3.5" />
                {customEmail}
              </a>
            )}
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              GitHub Profile
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>

        {/* Crisp White Right Content Canvas */}
        <div className="lg:col-span-8 p-8 sm:p-12 space-y-10">
          <section className="border-b border-slate-200 pb-8 space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
              {aiContent.headline}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{aiContent.pitchSummary}</p>
            <div className="pt-3 text-xs font-medium text-slate-800">
              {aiContent.highlightedSkills.join(' · ')}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Selected GitHub Projects
              </h3>
              <span className="font-mono-tabular text-xs text-slate-500">
                {profile.publicRepos} repos · {activity.totalStars} stars
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {topRepos.map((repo) => {
                const narrative = aiContent.projectNarratives[repo.name];
                return (
                  <article
                    key={repo.id}
                    className="rounded-xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono-tabular text-slate-500 gap-2">
                        <span className="truncate">{formatRepoLanguages(repo)}</span>
                        <span>{repo.stars}★</span>
                      </div>
                      <h4 className="font-display text-base font-bold text-slate-900">
                        {repo.name}
                      </h4>
                      <p className="text-xs font-semibold" style={{ color: accentColor }}>
                        {narrative?.technicalHighlight || 'Software Build'}
                      </p>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {narrative?.impactSummary || repo.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs font-semibold">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-900 hover:underline"
                      >
                        Code
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
                        >
                          Live
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
