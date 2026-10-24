import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { call_api, playAudio } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

interface UseActionPopoverReturn {
  handleClone: () => void;
  handleCopy: () => Promise<void>;
  handlePlayRecipe: () => Promise<void>;
  killAudio: () => void;
  handleDeleteDialog: () => void;
  handleDeleteRecipe: () => Promise<{ message: string; error: string }>;
  linkCopied: boolean;
  isPlayingAudio: boolean;
  isLoadingAudio: boolean;
  isDeleteDialogOpen: boolean;
}

export default function useActionPopover(
  recipe: ExtendedRecipe | null,
  updateRecipe: (audioLink: string) => void
): UseActionPopoverReturn {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleClone = useCallback(() => {
    if (!recipe) return;
    router.push({
      pathname: '/CreateRecipe',
      query: {
        oldIngredients: recipe.ingredients.map((i) => i.name),
      },
    });
  }, [recipe, router]);

  const handleCopy = useCallback(async () => {
    if (!recipe) return;
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/RecipeDetail?recipeId=${recipe._id}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [recipe]);

  const handlePlayRecipe = useCallback(async () => {
    if (!recipe) return;

    if (recipe.audio) {
      setIsLoadingAudio(true);
      try {
        await playAudio(recipe.audio, audioRef, () => {
          setIsPlayingAudio(false);
        });
        setIsPlayingAudio(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      } finally {
        setIsLoadingAudio(false);
      }
    } else {
      setIsLoadingAudio(true);
      try {
        const result = await call_api({
          address: '/api/tts',
          method: 'post',
          payload: { recipeId: recipe._id },
        });
        if (result.audio) {
          updateRecipe(result.audio);
          await playAudio(result.audio, audioRef, () => {
            setIsPlayingAudio(false);
          });
          setIsPlayingAudio(true);
        }
      } catch (error) {
        console.error('Error generating audio:', error);
      } finally {
        setIsLoadingAudio(false);
      }
    }
  }, [recipe, updateRecipe]);

  const killAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setIsLoadingAudio(false);
  }, []);

  const handleDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteRecipe = useCallback(async () => {
    if (!recipe) return { message: '', error: 'No recipe to delete' };
    try {
      const result = await call_api({
        address: `/api/delete-recipe?recipeId=${recipe._id}`,
        method: 'delete',
      });
      return { message: 'Recipe deleted successfully', error: '' };
    } catch (error) {
      return { message: '', error: 'Failed to delete recipe' };
    }
  }, [recipe]);

  return {
    handleClone,
    handleCopy,
    handlePlayRecipe,
    killAudio,
    handleDeleteDialog,
    handleDeleteRecipe,
    linkCopied,
    isPlayingAudio,
    isLoadingAudio,
    isDeleteDialogOpen,
  };
}