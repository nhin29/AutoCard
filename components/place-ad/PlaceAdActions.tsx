import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlaceAdActionsProps {
  onPublish: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
  isPublishing?: boolean;
  isEditMode?: boolean;
}

/**
 * Action buttons for Place Ad screen (Publish, Save Draft, Preview)
 */
export function PlaceAdActions({ onPublish, onSaveDraft, onPreview, isPublishing = false, isEditMode = false }: PlaceAdActionsProps) {
  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]}
        onPress={onPublish}
        disabled={isPublishing}
        {...(Platform.OS === 'web' && { cursor: isPublishing ? 'not-allowed' : 'pointer' })}>
        {isPublishing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.publishButtonText}>
              {isEditMode ? 'Updating...' : 'Publishing...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.publishButtonText}>
            {isEditMode ? 'Update Ad' : 'Publish Ad'}
          </Text>
        )}
      </TouchableOpacity>
      
      {onPreview && (
        <TouchableOpacity
          style={styles.previewButton}
          onPress={onPreview}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
      )}
      
      {onSaveDraft && (
        <TouchableOpacity
          style={styles.saveDraftButton}
          onPress={onSaveDraft}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.saveDraftButtonText}>Save as Draft</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  publishButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    marginLeft: 8,
  },
  publishButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
  saveDraftButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDraftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
});
