import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";

interface CancelFlowDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelFlowDialog({ open, onClose, onConfirm }: CancelFlowDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Cancel Flow?">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Do you want to cancel the flow? Task progress will be lost.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Keep Going
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Cancel Flow
        </Button>
      </div>
    </Dialog>
  );
}
