"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useMemo, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  SearchX,
  Sparkles,
  Trash2,
  LoaderCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Deletion modal state
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      GetInterviewList();
    }
  }, [user]);

  const GetInterviewList = async () => {
    try {
      const res = await fetch("/api/interviews");
      if (res.ok) {
        const result = await res.json();
        setInterviewList(result);
      } else {
        setInterviewList([]);
      }
    } catch (err) {
      console.error("Failed to fetch interview list:", err);
      setInterviewList([]);
    }
  };

  const counts = useMemo(() => {
    if (!interviewList) return { all: 0, technical: 0, behavioral: 0 };
    let technical = 0;
    let behavioral = 0;
    for (const item of interviewList) {
      if ((item.type || "").toLowerCase() === "behavioral") {
        behavioral += 1;
      } else {
        technical += 1;
      }
    }
    return {
      all: interviewList.length,
      technical,
      behavioral,
    };
  }, [interviewList]);

  const filteredAndSortedList = useMemo(() => {
    if (!interviewList) return [];

    const query = searchQuery.trim().toLowerCase();

    const filtered = interviewList.filter((interview) => {
      // 1. Search by jobPosition
      const matchesSearch =
        !query || (interview?.jobPosition || "").toLowerCase().includes(query);

      // 2. Filter by type
      const isBehavioral =
        (interview?.type || "").toLowerCase() === "behavioral";
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "behavioral" && isBehavioral) ||
        (typeFilter === "technical" && !isBehavioral);

      return matchesSearch && matchesType;
    });

    // 3. Sort
    filtered.sort((a, b) => {
      if (sortBy === "oldest") {
        return (a.id || 0) - (b.id || 0);
      }

      if (sortBy === "highest") {
        const aHasScore =
          typeof a.averageScore === "number" && !isNaN(a.averageScore);
        const bHasScore =
          typeof b.averageScore === "number" && !isNaN(b.averageScore);

        if (aHasScore && bHasScore) {
          if (b.averageScore !== a.averageScore) {
            return b.averageScore - a.averageScore;
          }
          return (b.id || 0) - (a.id || 0);
        }
        if (aHasScore && !bHasScore) return -1;
        if (!aHasScore && bHasScore) return 1;
        return (b.id || 0) - (a.id || 0);
      }

      if (sortBy === "lowest") {
        const aHasScore =
          typeof a.averageScore === "number" && !isNaN(a.averageScore);
        const bHasScore =
          typeof b.averageScore === "number" && !isNaN(b.averageScore);

        if (aHasScore && bHasScore) {
          if (a.averageScore !== b.averageScore) {
            return a.averageScore - b.averageScore;
          }
          return (b.id || 0) - (a.id || 0);
        }
        if (aHasScore && !bHasScore) return -1;
        if (!aHasScore && bHasScore) return 1;
        return (b.id || 0) - (a.id || 0);
      }

      // Default: "newest"
      return (b.id || 0) - (a.id || 0);
    });

    return filtered;
  }, [interviewList, searchQuery, typeFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortBy("newest");
  };

  const handleConfirmDelete = async () => {
    if (!interviewToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/interviews/${interviewToDelete.mockId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Interview deleted successfully");
        setInterviewList((prev) =>
          prev ? prev.filter((item) => item.mockId !== interviewToDelete.mockId) : []
        );
        setInterviewToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to delete interview");
        setInterviewToDelete(null);
      }
    } catch (err) {
      console.error("Delete interview error:", err);
      toast.error("Failed to delete interview");
      setInterviewToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-semibold text-xl tracking-tight text-foreground">
          Previous Mock Interviews
        </h2>
      </div>

      {interviewList !== null && interviewList.length > 0 && (
        <div className="space-y-3 bg-card/40 p-3 sm:p-4 rounded-xl border border-border/60">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by job position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-sm w-full bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
              <label htmlFor="sort-select" className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest score</option>
                <option value="lowest">Lowest score</option>
              </select>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("technical")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === "technical"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              Technical ({counts.technical})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("behavioral")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === "behavioral"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              Behavioral ({counts.behavioral})
            </button>
          </div>
        </div>
      )}

      {interviewList === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="p-5 space-y-4 border-border/60 bg-card">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28 rounded" />
              <div className="pt-2 flex gap-3">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : interviewList.length === 0 ? (
        <Card className="border border-dashed border-border bg-card/50 p-8 text-center my-3">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              No mock interviews yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              Click &quot;+ Start New Mock Interview&quot; above to create your first interview practice session.
            </p>
          </div>
        </Card>
      ) : filteredAndSortedList.length === 0 ? (
        <Card className="border border-dashed border-border bg-card/50 p-8 text-center my-3">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <SearchX className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-base">
                No mock interviews match your filters
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                Try adjusting your search query or type filters to find what you are looking for.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-1"
            >
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {filteredAndSortedList.map((interview) => (
            <InterviewItemCard
              key={interview.mockId || interview.id}
              interview={interview}
              onDelete={(item) => setInterviewToDelete(item)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!interviewToDelete}
        onOpenChange={(open) => {
          if (!isDeleting && !open) {
            setInterviewToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Interview?</DialogTitle>
            <DialogDescription className="pt-2">
              This will permanently delete this interview and all of its answers. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              autoFocus
              onClick={() => setInterviewToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="gap-1.5"
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewList;
