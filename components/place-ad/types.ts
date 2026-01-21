/**
 * Shared types for Place Ad components
 */

export interface DropdownOption {
  id: string;
  name: string;
  icon?: string;
}

export interface VehicleCategory extends DropdownOption {
  icon: string;
}

export interface ImageEditAction {
  type: 'setCover' | 'rotate' | 'moveUp' | 'moveDown' | 'delete';
  index: number;
}

export interface StoryEditAction {
  type: 'setCover' | 'delete';
  index: number;
}
