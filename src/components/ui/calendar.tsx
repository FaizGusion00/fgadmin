import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid, ListFilter } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps, DayPickerSingleProps, DayPickerRangeProps } from "react-day-picker";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type CalendarViewMode = 'day' | 'week' | 'month';

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
  viewMode = 'month',
  onViewModeChange,
  ...props
}: CalendarProps) {
  const [currentViewMode, setCurrentViewMode] = React.useState<CalendarViewMode>(viewMode);
  
  // Get the current month from props or use current date
  const currentMonth = props.defaultMonth || props.month || new Date();
  
  // Handle view mode change
  const handleViewModeChange = (newMode: CalendarViewMode) => {
    setCurrentViewMode(newMode);
    if (onViewModeChange) {
      onViewModeChange(newMode);
    }
  };
  
  // Calculate current week range for week view
  const getWeekRange = () => {
    const date = new Date(currentMonth);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0); // Set to beginning of day
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // Set to end of day
    
    return { from: weekStart, to: weekEnd };
  };

  // Navigate to previous/next week when in week view
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setDate(newMonth.getDate() + (direction === 'prev' ? -7 : 7));
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
  };
  // Split the props to handle different modes correctly
  const { selected, onSelect: originalOnSelect, ...restProps } = props;
  
  // Custom onSelect handler that adapts to the mode
  const handleSelect = React.useCallback((value: Date | DateRange | undefined) => {
    if (originalOnSelect) {
      originalOnSelect(value);
    }
  }, [originalOnSelect]);
  
  // Handle custom navigation based on view mode
  const handleNavigation = (action: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    
    switch (currentViewMode) {
      case 'day':
        // Navigate by a single day
        newMonth.setDate(newMonth.getDate() + (action === 'prev' ? -1 : 1));
        break;
        
      case 'week':
        // Navigate by a week
        newMonth.setDate(newMonth.getDate() + (action === 'prev' ? -7 : 7));
        break;
        
      case 'month':
      default:
        // Navigate by a month
        newMonth.setMonth(newMonth.getMonth() + (action === 'prev' ? -1 : 1));
        break;
    }
    
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
  };
  
  // Generate the appropriate props based on the current view mode
  const modeProps = React.useMemo(() => {
    switch (currentViewMode) {
      case 'week':
        const weekRange = getWeekRange();
        // For week view, we need a range selection
        const rangeSelected = (selected && 'from' in selected) ? selected : { from: weekRange.from, to: weekRange.to };
        return {
          mode: 'range' as const,
          selected: rangeSelected,
          onSelect: handleSelect as any,
          captionLayout: 'buttons' as const,
          weekStartsOn: 1 as const, // Start on Monday
          fixedWeeks: true,
          defaultMonth: weekRange.from, // Ensure the calendar shows the correct week
          fromDate: weekRange.from,
          toDate: weekRange.to,
          numberOfMonths: 1,
          pagedNavigation: true
        };
      
      case 'day':
        // For day view, we need a single date selection
        const daySelected = (selected && !('from' in selected) && selected instanceof Date) ? selected : currentMonth;
        return {
          mode: 'single' as const,
          selected: daySelected,
          onSelect: handleSelect as any,
          defaultMonth: daySelected,
        };
      
      case 'month':
      default:
        // For month view, we show a full month with week numbers
        return {
          mode: 'default' as const,
          captionLayout: 'dropdown-buttons' as const,
          showWeekNumber: true,
          fixedWeeks: true,
          defaultMonth: currentMonth,
          today: new Date(),
          pagedNavigation: true
        };
    }
  }, [currentViewMode, currentMonth, selected, handleSelect]);
  
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
        
        <div className="flex">
          <ToggleGroup type="single" value={currentViewMode} onValueChange={(value) => value && handleViewModeChange(value as CalendarViewMode)}>
            <ToggleGroupItem value="day" aria-label="Day view">
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Day</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view">
              <ListFilter className="h-4 w-4" />
              <span className="sr-only">Week</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Month view">
              <Grid className="h-4 w-4" />
              <span className="sr-only">Month</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
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
          day_today: "bg-accent text-accent-foreground",
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
