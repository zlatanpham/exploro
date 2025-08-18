"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, normalizeVietnamese } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  searchText?: string; // Additional text to search against
  category?: string;
  description?: string;
  disabled?: boolean;
}

interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
}

interface SearchableComboboxProps {
  options: ComboboxOption[] | ComboboxGroup[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
  groupByCategory?: boolean;
  maxHeight?: string;
}

function isGroupedOptions(
  options: ComboboxOption[] | ComboboxGroup[],
): options is ComboboxGroup[] {
  return (
    options.length > 0 &&
    !!options[0] &&
    "label" in options[0] &&
    "options" in options[0]
  );
}

export function SearchableCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  emptyText = "No options found",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  showSearch = true,
  groupByCategory = false,
  maxHeight = "300px",
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Clear search when opening
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setSearchQuery("");
    }
  };

  // Normalize all options into a flat array for searching
  const flatOptions = React.useMemo(() => {
    if (isGroupedOptions(options)) {
      return options.flatMap((group) => group.options);
    }
    return options;
  }, [options]);

  // Filter options based on search query using Vietnamese normalization
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }

    const normalizedQuery = normalizeVietnamese(searchQuery.toLowerCase());

    const matchesQuery = (option: ComboboxOption): boolean => {
      const normalizedLabel = normalizeVietnamese(option.label.toLowerCase());
      const normalizedSearchText = option.searchText
        ? normalizeVietnamese(option.searchText.toLowerCase())
        : "";
      const normalizedDescription = option.description
        ? normalizeVietnamese(option.description.toLowerCase())
        : "";

      return (
        normalizedLabel.includes(normalizedQuery) ||
        normalizedSearchText.includes(normalizedQuery) ||
        normalizedDescription.includes(normalizedQuery)
      );
    };

    if (isGroupedOptions(options)) {
      return options
        .map((group) => ({
          ...group,
          options: group.options.filter(matchesQuery),
        }))
        .filter((group) => group.options.length > 0);
    }

    return options.filter(matchesQuery);
  }, [options, searchQuery]);

  // Group options by category if requested and not already grouped
  const finalOptions = React.useMemo(() => {
    if (groupByCategory && !isGroupedOptions(filteredOptions)) {
      const grouped = filteredOptions.reduce(
        (acc, option) => {
          const category = option.category || "Other";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(option);
          return acc;
        },
        {} as Record<string, ComboboxOption[]>,
      );

      return Object.entries(grouped).map(([category, categoryOptions]) => ({
        label: category,
        options: categoryOptions,
      }));
    }

    return filteredOptions;
  }, [filteredOptions, groupByCategory]);

  // Find the selected option
  const selectedOption = flatOptions.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onValueChange?.("");
    } else {
      onValueChange?.(selectedValue);
    }
    handleOpenChange(false);
  };

  const renderOptions = () => {
    if (isGroupedOptions(finalOptions)) {
      return finalOptions.map((group) => (
        <CommandGroup key={group.label} heading={group.label}>
          {group.options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => handleSelect(option.value)}
              disabled={option.disabled}
              className="flex items-center justify-between"
            >
              <span>{option.label}</span>
              <Check
                className={cn(
                  "ml-auto h-4 w-4",
                  value === option.value ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      ));
    }

    return finalOptions.map((option) => (
      <CommandItem
        key={option.value}
        value={option.value}
        onSelect={() => handleSelect(option.value)}
        disabled={option.disabled}
        className="flex items-center justify-between"
      >
        <span>{option.label}</span>
        <Check
          className={cn(
            "ml-auto h-4 w-4",
            value === option.value ? "opacity-100" : "opacity-0",
          )}
        />
      </CommandItem>
    ));
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-9 w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          {showSearch && (
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          )}
          <CommandList style={{ maxHeight }}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {renderOptions()}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
