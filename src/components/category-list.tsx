
"use client"

import * as React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileSearch, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { IconForCategory } from "@/lib/utils";
import type { Category } from "@/app/(dashboard)/categories/page";
import { EditCategorySheet } from "@/components/edit-category-sheet";
import { DeleteCategoryDialog } from "@/components/delete-category-dialog";

interface CategoryListProps {
    title: string;
    categories: Category[];
    usedCategoryIds: Set<number>;
}

export function CategoryList({ title, categories, usedCategoryIds }: CategoryListProps) {
    const [editSheetOpen, setEditSheetOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setEditSheetOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    };

    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center rounded-lg bg-muted/50 p-10 min-h-[200px]">
                <FileSearch className="w-16 h-16 text-muted-foreground/50"/>
                <h3 className="text-lg font-semibold mt-4">No {title} Categories</h3>
                <p className="text-muted-foreground text-sm">Add a category to see it here.</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-2">
                {categories.map(category => {
                    const isUsed = usedCategoryIds.has(category.id);
                    return (
                        <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 transition-colors hover:bg-muted">
                            <div className="flex items-center gap-4">
                                <IconForCategory categoryName={category.name} className="w-5 h-5 text-muted-foreground" />
                                <span className="font-medium">{category.name}</span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditClick(category)} disabled={isUsed}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteClick(category)} disabled={isUsed} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                })}
            </div>

            {selectedCategory && (
                <>
                    <EditCategorySheet 
                        category={selectedCategory}
                        open={editSheetOpen}
                        onOpenChange={setEditSheetOpen}
                    />
                    <DeleteCategoryDialog
                        category={selectedCategory}
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                    />
                </>
            )}
        </>
    )
}
