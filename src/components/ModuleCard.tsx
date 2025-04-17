"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Trash2, Pencil, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteModule, updateModule } from "@/services/modules";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { useConfirm } from "./use-confirm";
import toast from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Module {
  _id: string;
  title: string;
  keywords: string[];
}

interface ModuleCardProps {
  module: Module;
  onUpdated: () => void;
  onDeleted: () => void;
}

export const ModuleCard = ({
  module,
  onDeleted,
  onUpdated,
}: ModuleCardProps) => {
  const router = useRouter();
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(module.title);
  const [keywordsString, setKeywordsString] = useState(
    module.keywords.join("\n")
  );

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action cannot be undone"
  );

  const handleDelete = async () => {
    const confirmed = await confirm();
    if (!confirmed) return;
    try {
      await deleteModule(module._id);
      toast.success("Module deleted successfully");
      onDeleted();
    } catch (error) {
      toast.error("Error deleting module");
    }
  };

  const handleEdit = async () => {
    const trimmedTitle = newTitle.trim();
    const trimmedKeywords = keywordsString
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (!trimmedTitle || trimmedKeywords.length === 0) {
      setError("Please enter valid title and keywords.");
      return;
    }

    if (trimmedKeywords.length > 30) {
      setError("You can only enter up to 30 keywords.");
      return;
    }

    try {
      await updateModule(module._id, trimmedTitle, trimmedKeywords);
      toast.success("Module updated successfully");
      setEditOpen(false);
      onUpdated();
    } catch (error) {
      toast.error("Error updating module");
    }
  };

  return (
    <>
      <ConfirmDialog />
      <Card className="p-4 flex items-center justify-between hover:shadow-md">
        {/* Left: title + dropdown */}
        <div
          className="flex flex-col gap-2 cursor-pointer"
          onClick={() => router.replace(`/dashboard/module/${module._id}`)}
        >
          <p className="font-semibold text-base text-primary">{module.title}</p>
          <Select>
            <SelectTrigger
              className="w-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="view keyword" />
            </SelectTrigger>
            <SelectContent>
              {module.keywords.map((keyword, index) => (
                <SelectItem key={index} value={keyword}>
                  {keyword}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right: buttons */}
        <div className="flex items-center gap-2">
          <Dialog
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) {
                setNewTitle(module.title);
                setKeywordsString(module.keywords.join("\n"));
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="icon"
              >
                <Pencil className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-lg">
              <DialogHeader>
                <DialogTitle>Edit Module</DialogTitle>
              </DialogHeader>

              {error && (
                <div className="bg-destructive/15 rounded-md flex p-3 items-center gap-x-2 text-sm text-destructive">
                  <TriangleAlert className="size-4" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Module Title"
                />
                <Textarea
                  className="min-h-[120px] max-h-[200px] resize-y"
                  value={keywordsString}
                  onChange={(e) => setKeywordsString(e.target.value)}
                  placeholder="Enter one keyword per line"
                />
                <p className="text-sm text-muted-foreground">
                  {
                    keywordsString
                      .split("\n")
                      .map((k) => k.trim())
                      .filter((k) => k.length > 0).length
                  }
                  /30 keywords
                </p>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  onClick={handleEdit}
                  className="bg-[#3f99e9] hover:bg-blue-500 font-semibold cursor-pointer text-white"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            size="icon"
            onClick={(e) => {
              handleDelete();
              e.stopPropagation();
            }}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </>
  );
};
