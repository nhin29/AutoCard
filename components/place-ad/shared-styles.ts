import { StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';

const HORIZONTAL_PADDING = 16;
const GRID_GAP = 8;
const GRID_COLUMNS = 4;

/**
 * Hook to calculate responsive image size for grid
 * Use this instead of the static IMAGE_SIZE export
 * 
 * @example
 * const imageSize = useImageGridSize();
 */
export function useImageGridSize(): number {
  const { width } = useWindowDimensions();
  return (width - (HORIZONTAL_PADDING * 2) - (GRID_GAP * (GRID_COLUMNS - 1))) / GRID_COLUMNS;
}

/**
 * @deprecated Use useImageGridSize() hook instead for responsive sizing
 * This is kept for backward compatibility but will use a default width
 */
export const IMAGE_SIZE = 80; // Fallback default, components should use useImageGridSize()

export const sharedStyles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontFamily: 'system-ui',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  categoryPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    color: '#000000',
    fontFamily: 'system-ui',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalDropdownList: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryItemSelected: {
    backgroundColor: '#F9FAFB',
  },
  categoryItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  categoryItemTextSelected: {
    fontWeight: '600',
    color: '#4CAF50',
  },
});
