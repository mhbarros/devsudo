import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

interface ConcluirFlowButtonProps {
  onClick: () => void;
}

export function ConcluirFlowButton({ onClick }: ConcluirFlowButtonProps) {
  return (
    <Button onClick={onClick} className="w-full gap-2" size="lg">
      <CheckCircle2 size={18} />
      Complete Flow
    </Button>
  );
}
