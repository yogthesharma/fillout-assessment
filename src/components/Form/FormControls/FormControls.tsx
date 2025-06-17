"use client";

import React, { useState, useRef, useEffect } from "react";
import { classNames } from "@/utils/classNames";
import { FormView } from "@/types/forms";
import VerticleDots from "@/svgs/VerticleDots";
import FileIcon from "@/svgs/FileIcon";

export interface FormControlsProps {
  views: FormView[];
  onViewsChange: (newViews: string[]) => void;
  onAddView: (viewLabel: string) => void;
  onDeleteView: (viewLabel: string) => void;
  onRenameView: (oldLabel: string, newLabel: string) => void;
  currentViewIndex: number;
  onViewIndexChange: (index: number) => void;
}

const FormControls: React.FC<FormControlsProps> = ({
  currentViewIndex,
  onAddView,
  onDeleteView,
  onRenameView,
  onViewIndexChange,
  onViewsChange,
  views,
}) => {
  const pages = views.map(view => view.label);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [, setDraggedItem] = useState<string | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    pageIndex: number;
  }>({ visible: false, x: 0, y: 0, pageIndex: -1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const calculateTargetPosition = (mouseX: number) => {
    if (!containerRef.current || draggedIndex === null) return draggedIndex;

    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = mouseX - containerRect.left;

    const itemPositions = itemRefs.current
      .map((ref, index) => {
        if (!ref || index === draggedIndex) return null;
        const rect = ref.getBoundingClientRect();
        return {
          index,
          center: (rect.left + rect.right) / 2 - containerRect.left,
        };
      })
      .filter(Boolean);

    let newTargetIndex = draggedIndex;

    if (itemPositions.length > 0 && relativeX < itemPositions[0]!.center) {
      newTargetIndex = 0;
    } else {
      for (let i = 0; i < itemPositions.length; i++) {
        const current = itemPositions[i]!;
        if (relativeX >= current.center) {
          newTargetIndex = current.index + 1;
        }
      }
    }

    if (newTargetIndex > draggedIndex) {
      newTargetIndex--;
    }

    return Math.max(0, Math.min(newTargetIndex, pages.length - 1));
  };

  const getElementTransform = (index: number, page: string) => {
    if (!isDragActive || draggedIndex === null) return "translateX(0px)";

    const originalIndex = pages.indexOf(page);

    if (originalIndex === draggedIndex) {
      return `translateX(${dragOffset.x}px)`;
    }

    if (targetIndex !== null && targetIndex !== draggedIndex) {
      const elementWidth = itemRefs.current[0]?.offsetWidth || 0;
      const gap = 16;
      const slideDistance = elementWidth + gap;

      if (
        targetIndex < draggedIndex &&
        originalIndex >= targetIndex &&
        originalIndex < draggedIndex
      ) {
        return `translateX(${slideDistance}px)`;
      }

      if (
        targetIndex > draggedIndex &&
        originalIndex <= targetIndex &&
        originalIndex > draggedIndex
      ) {
        return `translateX(-${slideDistance}px)`;
      }
    }

    return "translateX(0px)";
  };

  const handleInsertPage = () => {
    const pageName = prompt("Enter the name of the new page:");
    if (pageName && pageName.trim()) {
      onAddView(pageName.trim());
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedIndex !== null && isDragActive) {
        const newTargetIndex = calculateTargetPosition(e.clientX);
        setTargetIndex(newTargetIndex);

        setDragOffset({
          x: e.clientX - initialMousePos.x,
          y: e.clientY - initialMousePos.y,
        });
      }
    };

    const handleMouseUp = () => {
      if (draggedIndex !== null && isDragActive && targetIndex !== null) {
        const newPages = [...pages];
        const [draggedItem] = newPages.splice(draggedIndex, 1);
        newPages.splice(targetIndex, 0, draggedItem);
        onViewsChange(newPages); // Fixed: Use onViewsChange instead of setPages

        setDraggedIndex(null);
        setDraggedItem(null);
        setTargetIndex(null);
        setIsDragActive(false);
        setDragOffset({ x: 0, y: 0 });
        setInitialMousePos({ x: 0, y: 0 });
      } else {
        setDraggedIndex(null);
        setDraggedItem(null);
        setTargetIndex(null);
        setIsDragActive(false);
        setDragOffset({ x: 0, y: 0 });
        setInitialMousePos({ x: 0, y: 0 });
      }
    };

    const handleClickOutside = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    if (isDragActive) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }

    if (contextMenu.visible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.userSelect = "";
    };
  }, [
    draggedIndex,
    isDragActive,
    targetIndex,
    pages,
    initialMousePos,
    contextMenu.visible,
    onViewsChange, // Added to dependencies
  ]);

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    setDraggedIndex(index);
    setDraggedItem(pages[index]);
    setTargetIndex(index);
    setIsDragActive(true);
    setInitialMousePos({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleAddPage = () => {
    const pageName = prompt("Enter the name of the new page:");
    if (pageName && pageName.trim()) {
      onAddView(pageName.trim());
    }
  };

  const handleContextMenu = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    const menuHeight = 280; // Approximate height of the context menu
    const windowHeight = window.innerHeight;
    const clickY = event.clientY;

    // If menu would go below screen, position it above the click point
    const shouldOpenUpward = clickY + menuHeight > windowHeight;

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: shouldOpenUpward ? clickY - menuHeight : clickY,
      pageIndex: index,
    });
  };

  const handleDotsClick = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 280; // Approximate height of the context menu
    const windowHeight = window.innerHeight;

    // If menu would go below screen, position it above the button
    const shouldOpenUpward = rect.bottom + menuHeight > windowHeight;

    setContextMenu({
      visible: true,
      x: rect.right,
      y: shouldOpenUpward ? rect.top - menuHeight : rect.bottom,
      pageIndex: index,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, pageIndex: -1 });
  };

  const handleMenuAction = (action: string, index: number) => {
    switch (action) {
      case 'setFirst':
        const newPages = [...pages];
        const [item] = newPages.splice(index, 1);
        newPages.unshift(item);
        onViewsChange(newPages);
        onViewIndexChange(0); // Set focus to first page
        break;
      case 'rename':
        const newName = prompt("Enter new name:", pages[index]);
        if (newName && newName.trim()) {
          onRenameView(pages[index], newName.trim());
        }
        break;
      case 'copy':
        onAddView(`${pages[index]} Copy`);
        break;
      case 'duplicate':
        onAddView(pages[index]);
        break;
      case 'delete':
        if (pages.length > 1) {
          onDeleteView(pages[index]);
          if (currentViewIndex >= index && currentViewIndex > 0) {
            onViewIndexChange(currentViewIndex - 1);
          }
        }
        break;
    }
    closeContextMenu();
  };

  const handleButtonClick = (index: number) => {
    onViewIndexChange(index);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative flex items-center p-4 rounded-xl"
      >
        {/* Continuous dashed line background - starts after first element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-0 border-t-2 border-dashed border-gray-200 ml-24"></div>
        </div>

        {/* Insert zone before first item */}
        <div
          className="group relative flex items-center justify-center w-8 h-8 cursor-pointer z-10"
          onClick={() => handleInsertPage()}
        >
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-400 hover:bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>

        {pages.map((page, index) => {
          const isDragged = index === draggedIndex && isDragActive;
          const isCurrentView = index === currentViewIndex; // Added current view indicator

          return (
            <React.Fragment key={page}>
              <button
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onMouseDown={(e) => handleMouseDown(index, e)}
                onClick={() => handleButtonClick(index)} // Added click handler
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onContextMenu={(e) => handleContextMenu(e, index)}
                style={{
                  transform: getElementTransform(index, page),
                  zIndex: isDragged ? 100 : 20,
                }}
                className={classNames(
                  "rounded-lg text-sm px-4 py-2.5 font-medium relative flex items-center justify-between gap-2",
                  isCurrentView
                    ? "text-[#556178] bg-[#DDDFE5]" // Active state styling
                    : "text-[#677289] bg-[#F1F1F3]", // Normal state styling
                  "hover:bg-[#DDDFE5] hover:text-[#556178]",
                  "focus:outline-none select-none",
                  "transition-colors duration-100",
                  isDragged
                    ? "cursor-grabbing bg-[#9DA4B240] scale-105"
                    : "cursor-pointer"
                )}
              >
                <FileIcon strokeColor={isCurrentView ? "#F59D0E" : undefined} />
                {page}
                {isCurrentView ? <span onClick={(e) => handleDotsClick(e, index)}><VerticleDots /></span> : null}
                {/* Three dots overlay when focused */}
                {focusedIndex === index && !isDragged && (
                  <div
                    className="absolute top-1 right-1 bg-gray-600 hover:bg-gray-700 rounded p-1 cursor-pointer"
                    onClick={(e) => handleDotsClick(e, index)}
                  >
                    <div className="flex flex-col items-center justify-center w-3 h-3">
                      <div className="w-0.5 h-0.5 bg-white rounded-full mb-0.5"></div>
                      <div className="w-0.5 h-0.5 bg-white rounded-full mb-0.5"></div>
                      <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>


              {index < pages.length - 1 && (
                <div
                  className="group relative flex items-center justify-center w-8 h-8 cursor-pointer mx-2 z-10"
                  onClick={() => handleInsertPage()}
                >
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-400 hover:bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Insert zone after last item */}
        <div
          className="group relative flex items-center justify-center w-8 h-8 cursor-pointer z-10"
          onClick={() => handleInsertPage()}
        >
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-400 hover:bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>

        {/* Add Page button at the end */}
        <button
          onClick={handleAddPage}
          className="ml-4 rounded-lg text-sm px-4 py-2.5 font-medium border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors duration-200 relative z-20"
        >
          + Add Page
        </button>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48 z-50"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={() =>
                handleMenuAction("setFirst", contextMenu.pageIndex)
              }
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              Set as first page
            </button>

            <button
              onClick={() => handleMenuAction("rename", contextMenu.pageIndex)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Rename
            </button>

            <button
              onClick={() => handleMenuAction("copy", contextMenu.pageIndex)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </button>

            <button
              onClick={() =>
                handleMenuAction("duplicate", contextMenu.pageIndex)
              }
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              Duplicate
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => handleMenuAction("delete", contextMenu.pageIndex)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
              disabled={pages.length <= 1}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              Other
              <span className="ml-auto text-gray-400">⋮</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormControls;