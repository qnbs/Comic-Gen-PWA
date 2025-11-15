import { createSelector } from 'reselect';
import { RootState } from '../app/store';
import { SortOption } from '../components/comic-library/types';

const selectComics = (state: RootState) => state.library.comics;
// Pass component state as arguments to the selector
const selectSearchQuery = (_state: RootState, searchQuery: string) => searchQuery;
const selectSortOrder = (
  _state: RootState,
  _searchQuery: string,
  sortOrder: SortOption,
) => sortOrder;

export const selectFilteredAndSortedComics = createSelector(
  [selectComics, selectSearchQuery, selectSortOrder],
  (comics, searchQuery, sortOrder) => {
    return [...comics]
      .filter((comic) =>
        comic.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case 'date-asc':
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'date-desc':
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
  },
);
