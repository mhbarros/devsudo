import { Rocket } from "lucide-react";
import { Button } from "../ui/Button";

interface StartFlowButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function StartFlowButton({ disabled, onClick }: StartFlowButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full gap-2"
      size="lg"
    >
      <Rocket size={18} />
      Start Flow
    </Button>
  );
}
