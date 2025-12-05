import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceReview } from "../../types";
import { ServiceReviewForm } from "../service-review-form";

type ServiceReviewEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ServiceReview | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ServiceReviewEditDialog({
  open,
  onOpenChange,
  review,
  onSuccess,
  onCancel,
}: ServiceReviewEditDialogProps) {
  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش بررسی</DialogTitle>
          <DialogDescription>ویرایش اطلاعات بررسی سرویس</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ServiceReviewForm
            review={review}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
