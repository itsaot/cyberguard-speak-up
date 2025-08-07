
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  emoji: string;
  userId: string;
  username: string;
}

interface EmojiReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => Promise<void>;
  disabled?: boolean;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😢', '😡', '🤗', '💪', '🙏', '✨', '😞', '💔', '🫂', '😔'];

const EmojiReactions = ({ reactions, onReact, disabled = false }: EmojiReactionsProps) => {
  const [isReacting, setIsReacting] = useState(false);
  const { toast } = useToast();

  const handleReact = async (emoji: string) => {
    if (disabled || isReacting) return;

    setIsReacting(true);
    try {
      await onReact(emoji);
      toast({
        title: "Reaction added",
        description: `You reacted with ${emoji}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to react",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReacting(false);
    }
  };

  const getReactionCount = (emoji: string) => {
    return reactions.filter(r => r.emoji === emoji).length;
  };

  const hasUserReacted = (emoji: string) => {
    // For now, we'll just check if there are any reactions with this emoji
    // In a real app, you'd check against the current user's ID
    return reactions.some(r => r.emoji === emoji);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {EMOJI_OPTIONS.map((emoji) => {
        const count = getReactionCount(emoji);
        const userReacted = hasUserReacted(emoji);
        
        return (
          <Button
            key={emoji}
            variant={userReacted ? "default" : "outline"}
            size="sm"
            onClick={() => handleReact(emoji)}
            disabled={disabled || isReacting}
            className={`text-sm h-8 ${count > 0 ? 'min-w-[60px]' : ''}`}
          >
            <span className="mr-1">{emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default EmojiReactions;
