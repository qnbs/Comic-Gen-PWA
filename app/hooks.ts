import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import React from 'react';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

const FOCUSABLE_ELEMENTS =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (
  ref: React.RefObject<HTMLElement>,
  isOpen: boolean,
  onClose: () => void,
) => {
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isOpen && ref.current) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      const focusableElements =
        ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab') {
          const focusableElements =
            ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS) ??
            [];
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previouslyFocusedElement.current?.focus();
      };
    }
  }, [isOpen, ref, onClose]);
};
