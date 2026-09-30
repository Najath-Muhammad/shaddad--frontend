import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/useTheme';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { driverApi, DriverProfile } from '../../api/driver.api';
import { showError, showSuccess } from '../../utils/alertUtils';

// Backend server base URL (strip /api/v1 since upload URLs are root-relative)
const SERVER_BASE = 'http://192.168.220.41:5000';

interface DocumentUploadScreenProps {
  onBack: () => void;
}

type DocType = 'ID' | 'LICENSE' | 'REGISTRATION' | 'PROFILE_PHOTO' | 'VEHICLE_PHOTO' | 'INSURANCE';

interface DocConfig {
  type: DocType;
  title: string;
  description: string;
  /** Field name multer uses on the backend (must match DriverService.uploadDocuments) */
  fieldName: string;
  /** Extracts the existing URL from the fetched profile */
  getExistingUrl: (profile: DriverProfile) => string | null;
  /** If true, requires the driver to have added a vehicle before uploading */
  requiresVehicle?: boolean;
}

const DOCUMENTS: DocConfig[] = [
  {
    type: 'PROFILE_PHOTO',
    title: 'Profile Photo',
    description: 'Upload a clear, professional photo of yourself.',
    fieldName: 'profilePhoto',
    getExistingUrl: (p) => p.profilePhotoUrl,
  },
  {
    type: 'ID',
    title: 'ID / Iqama',
    description: 'Upload a clear photo of your national ID or Iqama (front side).',
    fieldName: 'nationalIdFront',
    getExistingUrl: (p) => p.nationalIdFrontUrl,
  },
  {
    type: 'LICENSE',
    title: 'Driving License',
    description: 'Upload your valid Saudi driving license.',
    fieldName: 'license',
    getExistingUrl: (p) => p.licenseUrl,
  },
  {
    type: 'VEHICLE_PHOTO',
    title: 'Vehicle Photo',
    description: 'Upload a clear photo of your vehicle from the outside.',
    fieldName: 'vehiclePhoto',
    getExistingUrl: (p) => p.vehicle?.vehiclePhotoUrl ?? null,
    requiresVehicle: true,
  },
  {
    type: 'REGISTRATION',
    title: 'Vehicle Registration (Istimara)',
    description: 'Upload your vehicle registration card.',
    fieldName: 'registration',
    getExistingUrl: (p) => p.vehicle?.registrationUrl ?? null,
    requiresVehicle: true,
  },
  {
    type: 'INSURANCE',
    title: 'Vehicle Insurance',
    description: 'Upload your valid vehicle insurance document.',
    fieldName: 'insurance',
    getExistingUrl: (p) => p.vehicle?.insuranceUrl ?? null,
    requiresVehicle: true,
  },
];

export const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({ onBack }) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocConfig | null>(null);
  /** Tracks newly uploaded local URIs this session so we show them immediately */
  const [sessionUploads, setSessionUploads] = useState<Partial<Record<DocType, string>>>({});

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await driverApi.getDriverProfile();
      if (res.data) setProfile(res.data);
    } catch {
      // silently fail — UI will just show no existing docs
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to upload documents.');
      return false;
    }
    return true;
  };

  const handleUpload = async (doc: DocConfig) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      exif: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const fileName = asset.fileName ?? `${doc.fieldName}-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setUploadingType(doc.type);
    try {
      const formData = new FormData();
      formData.append('documentType', doc.type);

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append(doc.fieldName, blob, fileName);
      } else {
        formData.append(doc.fieldName, {
          uri,
          name: fileName,
          type: mimeType,
        } as unknown as Blob);
      }

      await driverApi.uploadDocuments(formData);

      // Store the local URI so the thumbnail shows immediately
      setSessionUploads((prev) => ({ ...prev, [doc.type]: uri }));
      // Also refresh profile from server to get the persisted URL
      void fetchProfile();

      showSuccess(`${doc.title} uploaded successfully.`);
    } catch (err: unknown) {
      showError(err, 'Upload Failed');
    } finally {
      setUploadingType(null);
    }
  };

  const getDisplayUrl = (doc: DocConfig): string | null => {
    // Prefer the session-local URI (no network needed, instant)
    const sessionUri = sessionUploads[doc.type];
    if (sessionUri) return sessionUri;
    // Fall back to the persisted server URL
    const serverPath = profile ? doc.getExistingUrl(profile) : null;
    if (serverPath) return `${SERVER_BASE}${serverPath}`;
    return null;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Upload Documents"
        subtitle="Verification documents"
        rightAction={<Button title="Back" variant="outline" onPress={onBack} />}
      />

      {loadingProfile ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading existing documents…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.listCard}>
            {DOCUMENTS.map((doc, index) => {
              const displayUrl = getDisplayUrl(doc);
              const isUploaded = !!displayUrl;
              const missingVehicle = doc.requiresVehicle && (!profile || !profile.vehicle);

              return (
                <TouchableOpacity
                  key={doc.type}
                  style={[styles.listItem, index === 0 && { borderTopWidth: 0 }, missingVehicle && { opacity: 0.5 }]}
                  disabled={missingVehicle}
                  onPress={() => setSelectedDoc(doc)}
                >
                  <View style={styles.listIconContainer}>
                    <Text style={styles.listIcon}>{isUploaded ? '📄' : '📁'}</Text>
                  </View>
                  <View style={styles.listTextContainer}>
                    <Text style={styles.listTitle}>{doc.title}</Text>
                    {missingVehicle ? (
                      <Text style={styles.listSubTextError}>Requires vehicle details</Text>
                    ) : (
                      <Text style={styles.listSubText}>{isUploaded ? 'Uploaded' : 'Pending upload'}</Text>
                    )}
                  </View>
                  {isUploaded ? (
                    <View style={styles.listStatusBadge}>
                      <Text style={styles.listStatusBadgeText}>✓</Text>
                    </View>
                  ) : (
                    <Text style={styles.listChevron}>›</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>
          <Text style={styles.hint}>
            Accepted formats: JPG, PNG, WEBP · Max size: 10MB
          </Text>
        </ScrollView>
      )}

      {/* ── Modal for uploading a specific document ── */}
      <Modal
        visible={!!selectedDoc}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDoc(null)}
      >
        {selectedDoc && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDoc.title}</Text>
              <TouchableOpacity onPress={() => setSelectedDoc(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalDesc}>{selectedDoc.description}</Text>

              {(() => {
                const displayUrl = getDisplayUrl(selectedDoc);
                const isUploaded = !!displayUrl;
                const isUploading = uploadingType === selectedDoc.type;

                return (
                  <>
                    {displayUrl && (
                      <View style={styles.previewContainer}>
                        <Image source={{ uri: displayUrl }} style={styles.preview} resizeMode="cover" />
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.uploadBtn, isUploaded && styles.uploadBtnDone]}
                      onPress={() => handleUpload(selectedDoc)}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <View style={styles.uploadBtnInner}>
                          <ActivityIndicator size="small" color={colors.primary} />
                          <Text style={[styles.uploadBtnText, { marginLeft: 8 }]}>Uploading…</Text>
                        </View>
                      ) : (
                        <Text style={[styles.uploadBtnText, isUploaded && styles.uploadBtnTextDone]}>
                          {isUploaded ? '🔄  Replace Document' : '📎  Choose File'}
                        </Text>
                      )}
                    </TouchableOpacity>
                    
                    {isUploaded && (
                      <View style={styles.modalSuccessBanner}>
                        <Text style={styles.modalSuccessText}>✓ Document uploaded successfully</Text>
                      </View>
                    )}
                  </>
                );
              })()}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listIcon: {
    fontSize: 20,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  listSubText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  listSubTextError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
  listStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listStatusBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '900',
  },
  listChevron: {
    fontSize: 20,
    color: colors.textLight,
    fontWeight: '400',
  },
  
  // ── Modal Styles ──
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    padding: 24,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 24,
  },
  modalSuccessBanner: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
  },
  modalSuccessText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
  previewContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  preview: {
    width: '100%',
    height: 160,
    backgroundColor: '#f3f4f6',
  },
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  uploadBtnDone: {
    borderColor: '#10b981',
    borderStyle: 'solid',
    backgroundColor: '#f0fdf4',
  },
  uploadBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  uploadBtnTextDone: {
    color: '#059669',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});

