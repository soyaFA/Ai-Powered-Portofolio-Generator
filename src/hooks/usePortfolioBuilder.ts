import { useCallback, useState } from 'react';
import { apiClient } from '../services/api';
import { buildGitHubBaselineContent, defaultAccentForTemplate } from '../utils/portfolioContent';
import type { PortfolioDocument, TemplateId } from '../types/portfolio';

export function usePortfolioBuilder() {
  const [portfolio, setPortfolio] = useState<PortfolioDocument | null>(null);
  const [preferredTemplate, setPreferredTemplate] = useState<TemplateId>('editorial');
  const [profileReadmeExcerpt, setProfileReadmeExcerpt] = useState<string | undefined>(
    undefined
  );
  const [regenCount, setRegenCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);

  const analyzeUsername = useCallback(
    async (username: string, templateOverride?: TemplateId) => {
      const chosenTemplate = templateOverride ?? preferredTemplate;
      setPreferredTemplate(chosenTemplate);
      setIsAnalyzing(true);
      setErrorMessage(null);
      setAiErrorMessage(null);

      try {
        const analysis = await apiClient.analyzeGitHub(username);
        const inferredTrack = analysis.activity.inferredFocus;
        const baselineContent = buildGitHubBaselineContent(analysis);

        setProfileReadmeExcerpt(analysis.profileReadmeExcerpt);
        setRegenCount(0);

        const initialDoc: PortfolioDocument = {
          id: '',
          username: analysis.profile.login,
          templateId: chosenTemplate,
          careerTrack: inferredTrack,
          accentColor: defaultAccentForTemplate(chosenTemplate),
          profile: analysis.profile,
          topRepos: analysis.topRepos,
          languages: analysis.languages,
          activity: analysis.activity,
          aiContent: baselineContent,
          customEmail: '',
          availableForHire: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setPortfolio(initialDoc);
        setIsAnalyzing(false);

        setIsOptimizing(true);
        try {
          const optimized = await apiClient.optimizeContent({
            profile: analysis.profile,
            topRepos: analysis.topRepos,
            languages: analysis.languages,
            activity: analysis.activity,
            careerTrack: inferredTrack,
            profileReadmeExcerpt: analysis.profileReadmeExcerpt,
            variationIndex: 0,
          });
          setPortfolio((current) =>
            current && current.username === analysis.profile.login
              ? { ...current, aiContent: optimized }
              : current
          );
        } catch (aiErr) {
          setAiErrorMessage(
            aiErr instanceof Error
              ? aiErr.message
              : 'Unable to reach AI optimization service.'
          );
        } finally {
          setIsOptimizing(false);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to analyze GitHub username.'
        );
        setIsAnalyzing(false);
      }
    },
    [preferredTemplate]
  );

  const optimizeAI = useCallback(async () => {
    if (!portfolio) return;
    const nextVariation = regenCount + 1;
    setRegenCount(nextVariation);
    setIsOptimizing(true);
    setAiErrorMessage(null);
    try {
      const optimized = await apiClient.optimizeContent({
        profile: portfolio.profile,
        topRepos: portfolio.topRepos,
        languages: portfolio.languages,
        activity: portfolio.activity,
        careerTrack: portfolio.careerTrack,
        profileReadmeExcerpt,
        variationIndex: nextVariation,
      });
      setPortfolio({
        ...portfolio,
        aiContent: optimized,
      });
    } catch (err) {
      setAiErrorMessage(
        err instanceof Error ? err.message : 'AI optimization failed.'
      );
    } finally {
      setIsOptimizing(false);
    }
  }, [portfolio, regenCount, profileReadmeExcerpt]);

  const resetStudio = useCallback(() => {
    setPortfolio(null);
    setErrorMessage(null);
    setAiErrorMessage(null);
    setRegenCount(0);
  }, []);

  return {
    portfolio,
    setPortfolio,
    preferredTemplate,
    setPreferredTemplate,
    profileReadmeExcerpt,
    isAnalyzing,
    isOptimizing,
    errorMessage,
    aiErrorMessage,
    setAiErrorMessage,
    analyzeUsername,
    optimizeAI,
    resetStudio,
  } as const;
}