"use client";

import { useState } from "react";

type Props = {
  bookedDates?: string[];
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  isVendorMode?: boolean;
  onToggleDateBlock?: (dateStr: string, isBlocked: boolean) => void;
};

export default function CalendarPicker({
  bookedDates = [],
  selectedDate = "",
  onSelectDate,
  isVendorMode = false,
  onToggleDateBlock
}: Props) {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const formatDateStr = (dayNum: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(dayNum).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const handleDateClick = (dateStr: string, isPast: boolean, isBooked: boolean) => {
    if (isPast && !isVendorMode) return;

    if (isVendorMode) {
      if (onToggleDateBlock) {
        onToggleDateBlock(dateStr, isBooked);
      }
      return;
    }

    if (isBooked) {
      alert(`⚠️ ${dateStr} is already booked or marked unavailable by the vendor. Please select an available date.`);
      return;
    }

    if (onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  return (
    <div className="bg-white border border-[#e8dfd2] p-4 sm:p-5 w-full select-none">
      {/* Calendar Header with Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd2]/70 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-[#242424] uppercase tracking-wider">
            {monthNames[month]} {year}
          </span>
          {isVendorMode && (
            <span className="text-[9px] bg-[#efe7da] text-[#c99a24] font-bold px-2 py-0.5 uppercase tracking-wider">
              Vendor Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center border border-[#e8dfd2] hover:bg-[#faf7f1] text-[#6b6258] text-xs transition cursor-pointer"
            title="Previous Month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center border border-[#e8dfd2] hover:bg-[#faf7f1] text-[#6b6258] text-xs transition cursor-pointer"
            title="Next Month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => (
          <div key={i} className="text-[9px] font-bold uppercase tracking-wider text-[#6b6258]/70 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month start */}
        {[...Array(firstDayIndex)].map((_, i) => (
          <div key={`empty-${i}`} className="h-9 sm:h-10"></div>
        ))}

        {/* Days of Month */}
        {[...Array(daysInMonth)].map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDateStr(dayNum);
          const isPast = dateStr < todayStr;
          const isBooked = bookedDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;

          let btnClass = "bg-white text-[#242424] hover:bg-[#efe7da]/50 border border-transparent";

          if (isPast) {
            btnClass = "bg-stone-50 text-[#6b6258]/35 cursor-not-allowed border-transparent";
          } else if (isSelected) {
            btnClass = "bg-[#c99a24] text-white font-bold border border-[#c99a24] shadow-xs scale-105 z-10";
          } else if (isBooked) {
            btnClass = "bg-rose-50 text-rose-700 font-semibold border border-rose-200 hover:bg-rose-100";
          } else {
            btnClass = "bg-emerald-50/40 text-emerald-900 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300";
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast && !isVendorMode}
              onClick={() => handleDateClick(dateStr, isPast, isBooked)}
              className={`h-9 sm:h-10 text-xs flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer ${btnClass}`}
              title={isBooked ? `${dateStr} - Reserved / Unavailable` : `${dateStr} - Available`}
            >
              <span className="leading-none text-[11px] font-medium">{dayNum}</span>
              {isBooked && (
                <span className="w-1 h-1 rounded-full bg-rose-500 mt-0.5"></span>
              )}
              {!isBooked && !isPast && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5 opacity-60"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 mt-3 border-t border-[#e8dfd2]/60 text-[9px] uppercase tracking-wider font-semibold text-[#6b6258]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 inline-block"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-100 border border-rose-300 inline-block"></span>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#c99a24] border border-[#c99a24] inline-block"></span>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
