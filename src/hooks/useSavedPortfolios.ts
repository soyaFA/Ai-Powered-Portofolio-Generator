import { useCallback, useEffect, useState } from 'react';
import { apiClient, getStoredToken } from '../services/api';
import type { AuthUser, PortfolioDocument } from '../types/portfolio';

export function useSavedPortfolios(authUser: AuthUser | null) {
  const [savedPortfolios, setSavedPortfolios] = useState<PortfolioDocument[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const loadSavedPortfolios = useCallback(async () => {
    if (!getStoredToken()) {
      setSavedPortfolios([]);
      return;
    }
    setIsLoadingSaved(true);
    try {
      const items = await apiClient.listPortfolios();
      setSavedPortfolios(items);
    } catch {
      setSavedPortfolios([]);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      void loadSavedPortfolios();
    } else {
      setSavedPortfolios([]);
    }
  }, [authUser, loadSavedPortfolios]);

  const savePortfolio = useCallback(
    async (docToSave: PortfolioDocument): Promise<PortfolioDocument | null> => {
      setIsSaving(true);
      setSaveFeedback(null);
      try {
        let saved: PortfolioDocument;
        if (docToSave.id) {
          saved = await apiClient.updatePortfolio(docToSave.id, {
            templateId: docToSave.templateId,
            careerTrack: docToSave.careerTrack,
            accentColor: docToSave.accentColor,
            aiContent: docToSave.aiContent,
            customEmail: docToSave.customEmail,
            availableForHire: docToSave.availableForHire,
          });
        } else {
          const { id: _id, userId: _uid, createdAt: _c, updatedAt: _u, ...payload } =
            docToSave;
          saved = await apiClient.savePortfolio(payload);
        }
        setSaveFeedback('Saved');
        await loadSavedPortfolios();
        setTimeout(() => setSaveFeedback(null), 2500);
        return saved;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to save portfolio.'
        );
      } finally {
        setIsSaving(false);
      }
    },
    [loadSavedPortfolios]
  );

  const deletePortfolio = useCallback(async (id: string) => {
    try {
      await apiClient.deletePortfolio(id);
      setSavedPortfolios((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch {
      
      return false;
    }
  }, []);

  return {
    savedPortfolios,
    isLoadingSaved,
    isSaving,
    saveFeedback,
    loadSavedPortfolios,
    savePortfolio,
    deletePortfolio,
  } as const;
}