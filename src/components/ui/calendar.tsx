import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps, DayPickerSingleProps, DayPickerRangeProps } from "react-day-picker";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarViewMode = 'day';

export interface CalendarProps extends Omit<DayPickerProps, 'mode' | 'onSelect'> {
  viewMode?: CalendarViewMode;
  onViewModeChange?: (mode: CalendarViewMode) => void;
  onSelect?: (date: Date | undefined | DateRange) => void;
  selected?: Date | DateRange;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  viewMode = 'day',
  onViewModeChange,
  ...props
}: CalendarProps) {
  // Get the current month from props or use current date
  const currentMonth = props.defaultMonth || props.month || new Date();
  
  // Split the props to handle different modes correctly
  const { selected, onSelect: originalOnSelect, ...restProps } = props;
  
  // Custom onSelect handler for day view
  const handleSelect = React.useCallback((value: Date | DateRange | undefined) => {
    if (originalOnSelect) {
      originalOnSelect(value);
    }
  }, [originalOnSelect]);
  
  // Handle navigation (previous/next day)
  const handleNavigation = (action: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    
    // Navigate by a single day
    newMonth.setDate(newMonth.getDate() + (action === 'prev' ? -1 : 1));
    
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
  };
  
  // Generate the appropriate props for day view
  const modeProps = React.useMemo(() => {
    return {
      mode: 'single' as const,
      selected: selected as Date | undefined,
      onSelect: handleSelect as any,
      captionLayout: 'dropdown-buttons' as const,
    };
  }, [selected, handleSelect]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => handleNavigation('prev')}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 w-7 p-0"
            )}
            title="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </button>
          <button
            onClick={() => handleNavigation('next')}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 w-7 p-0"
            )}
            title="Next"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </button>
        </div>
        
        {/* Calendar view selector removed as per requirement - only day view is available */}
      </div>
      
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-orange-500 text-white",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        }}
        numberOfMonths={1}
        {...restProps}
        {...modeProps}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
