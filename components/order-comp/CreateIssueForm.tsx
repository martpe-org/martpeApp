import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@/state/UserProvider";
import { useRouter } from "expo-router";
import { FetchOrderDetailType } from "../order/fetch-order-detail-type";
import { getPresignedUrlAction } from "../order/help/getPresignedUrl";
import { uploadOnPresignedURLAction } from "../order/help/uploadOnPresignedURL";
import { IssueLevels, IssueTaxonomy } from "@/constants/IGM_constants";
import { createIssueAction, CreateIssueBodyT } from "../order/help/create-issue";


interface CreateIssueFormProps {
  data: FetchOrderDetailType;
  onClose: () => void;
}

interface FormData {
  level: string;
  itemId: string;
  code: string;
  long_desc: string;
  images: ImagePicker.ImagePickerAsset[];
}

interface FormErrors {
  level?: string;
  itemId?: string;
  code?: string;
  long_desc?: string;
}

export const CreateIssueForm: React.FC<CreateIssueFormProps> = ({
  data,
  onClose,
}) => {
  const router = useRouter();
  const userName = useUser()((state) => state.firstName);
  const userPhone = useUser()((state) => state.phoneNumber);
  const userEmail = useUser()((state) => state.email);

  const [formData, setFormData] = useState<FormData>({
    level: "",
    itemId: "",
    code: "",
    long_desc: "",
    images: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.level) {
      newErrors.level = "Please select an issue type";
    }

    if (formData.level === "ITEM" && !formData.itemId) {
      newErrors.itemId = "Please select an item";
    }

    if (!formData.code) {
      newErrors.code = "Please select an issue category";
    }

    if (!formData.long_desc.trim()) {
      newErrors.long_desc = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (images: ImagePicker.ImagePickerAsset[]) => {
    try {
      const fileNames = images.map((image) => {
        const fileName = image.uri.split("/").pop() || `image_${Date.now()}`;
        return fileName;
      });

      const presignedData = await getPresignedUrlAction(fileNames);

      if (presignedData && presignedData.success) {
        const uploadPromises = images.map(async (image, index) => {
          const presignedUrl = presignedData.data[index]?.presignedUrl;
          if (presignedUrl) {
            const mimeType = image.mimeType || "image/jpeg";
            await uploadOnPresignedURLAction(presignedUrl, image.uri, mimeType);
            return presignedUrl.split("?")[0];
          }
          return null;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        return uploadedUrls.filter((url:any) => url !== null);
      } else {
        throw new Error("Failed to get presigned URLs");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      Alert.alert("Error", "Failed to upload images");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const body: Record<string, any> = {
        orderId: data._id,
        descriptor: {
          code: formData.code,
          short_desc: IssueTaxonomy[formData.level as keyof typeof IssueTaxonomy]?.find(
            (item :any) => item.code === formData.code
          )?.label || "",
          long_desc: formData.long_desc,
        },
        customer: {
          name: userName,
          phone: userPhone,
          email: userEmail || "support@martpe.in",
        },
      };

      if (formData.images.length > 0) {
        const imageUrls = await handleImageUpload(formData.images);
        if (!imageUrls) {
          return;
        }
        body.descriptor.images = imageUrls.map((url: string) => ({
          url,
          size_type: "xs",
        }));
      }

      if (formData.level === "ITEM" && formData.itemId) {
        body.items = [
          {
            catalog_id: formData.itemId,
            qty:
              data.order_items.find((item) => item.catalog_id === formData.itemId)
                ?.order_qty || 1,
          },
        ];
      }

      const res = await createIssueAction(body as CreateIssueBodyT);
      if (res.success) {
        Alert.alert("Success", "Issue created successfully", [
          {
            text: "OK",
            onPress: () => {
              onClose();
             // router.push(`/tickets/${res.data?._id}`);
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to create issue");
        console.error("Error creating issue:", res.error);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant permission to access photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...result.assets],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Issue Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Issue type</Text>
          <View style={[styles.pickerContainer, errors.level && styles.errorBorder]}>
            <Picker
              selectedValue={formData.level}
              onValueChange={(value) => updateFormData("level", value)}
              style={styles.picker}
            >
              <Picker.Item label="Select issue type" value="" />
              {IssueLevels.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>
          {errors.level && <Text style={styles.errorText}>{errors.level}</Text>}
        </View>

        {/* Item Selection (only if ITEM level is selected) */}
        {formData.level === "ITEM" && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Item</Text>
            <View style={[styles.pickerContainer, errors.itemId && styles.errorBorder]}>
              <Picker
                selectedValue={formData.itemId}
                onValueChange={(value) => updateFormData("itemId", value)}
                style={styles.picker}
              >
                <Picker.Item label="Select item" value="" />
                {data.order_items.map((item) => (
                  <Picker.Item
                    key={item.catalog_id}
                    label={item.name}
                    value={item.catalog_id}
                  />
                ))}
              </Picker>
            </View>
            {errors.itemId && <Text style={styles.errorText}>{errors.itemId}</Text>}
          </View>
        )}

        {/* Issue Category */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Issue category</Text>
          <View style={[styles.pickerContainer, errors.code && styles.errorBorder]}>
            <Picker
              selectedValue={formData.code}
              onValueChange={(value) => updateFormData("code", value)}
              style={styles.picker}
              enabled={
                formData.level &&
                (formData.level !== "ITEM" || formData.itemId)
              }
            >
              <Picker.Item label="Select issue category" value="" />
              {formData.level &&
                IssueTaxonomy[formData.level as keyof typeof IssueTaxonomy]?.map((item) => (
                  <Picker.Item
                    key={item.code}
                    label={item.label}
                    value={item.code}
                  />
                ))}
            </Picker>
          </View>
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, errors.long_desc && styles.errorBorder]}
            value={formData.long_desc}
            onChangeText={(text) => updateFormData("long_desc", text)}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.long_desc && (
            <Text style={styles.errorText}>{errors.long_desc}</Text>
          )}
        </View>

        {/* Images */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Images</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
            <Text style={styles.imagePickerText}>
              Tap to select images from gallery
            </Text>
          </TouchableOpacity>

          {formData.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Submitting</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
    fontSize: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
  },
  errorBorder: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  imagePickerButton: {
    height: 48,
    borderWidth: 2,
    borderColor: "#9ca3af",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  imagePickerText: {
    color: "#6b7280",
    fontSize: 12,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  imageWrapper: {
    position: "relative",
    width: 96,
    height: 96,
  },
  selectedImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  removeImageText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "400",
  },
  submitButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});