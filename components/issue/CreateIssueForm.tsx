import React, { useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";

import IssueImagePicker from "./IssueImagePicker";
import IssueTypeSelector from "./IssueTypeSelector";
import IssueDescriptionInput from "./IssueDescriptionInput";

import { getAsyncStorageItem } from "@/utility/asyncStorage";
import { FetchOrderDetailType } from "../order/fetch-order-detail-type";
import { getPresignedUrlAction } from "./help/getPresignedUrl";
import { uploadOnPresignedURLAction } from "./help/uploadOnPresignedURL";
import { IssueTaxonomy } from "@/constants/IGM_constants";
import { createIssueAction, CreateIssueBodyT } from "./help/create-issue";
import IssueCategorySelector from "./IssueCategorySelector";
import IssueItemSelector from "./IssueItemSelector";
import { router } from "expo-router";

interface CreateIssueFormProps {
  data: FetchOrderDetailType;
  onClose: () => void;
}

export default function CreateIssueForm({ data, onClose }: CreateIssueFormProps) {
  const [issueLevel, setIssueLevel] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [issueCode, setIssueCode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleImageUpload = async (imageUris: string[]) => {
    try {
      if (imageUris.length === 0) return [];

      // Extract file names from URIs
      const fileNames = imageUris.map((uri, index) => {
        const fileName = uri.split('/').pop() || `image_${index}.jpg`;
        return fileName;
      });

      const presignedData = await getPresignedUrlAction(fileNames);

      if (presignedData && presignedData.success) {
        console.log("Success in presigned URL", JSON.stringify(presignedData, null, 2));

        // Upload each image to its presigned URL
        for (let i = 0; i < presignedData.data.length; i++) {
          if (!imageUris[i]) continue;

          // Determine MIME type from file extension
          const uri = imageUris[i];
          const extension = uri.split('.').pop()?.toLowerCase();
          let mimeType = 'image/jpeg';

          if (extension === 'png') mimeType = 'image/png';
          else if (extension === 'gif') mimeType = 'image/gif';
          else if (extension === 'webp') mimeType = 'image/webp';

          await uploadOnPresignedURLAction(
            presignedData.data[i].presignedUrl,
            imageUris[i],
            mimeType
          );
        }

        return presignedData.data.map((item: any) => item.presignedUrl.split("?")[0]);
      } else {
        throw new Error("Failed to get presigned URLs");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      Alert.alert("Error", "Failed to upload images");
      return [];
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!issueLevel) {
      Alert.alert("Missing Field", "Please select an issue type.");
      return;
    }

    if (issueLevel === "ITEM" && !itemId) {
      Alert.alert("Missing Field", "Please select an item.");
      return;
    }

    if (!issueCode) {
      Alert.alert("Missing Field", "Please select an issue category.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing Field", "Please provide a description.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user info from AsyncStorage
      const userName = await getAsyncStorageItem("user-name") || "User";
      const userPhone = await getAsyncStorageItem("user-phone") || "";
      const userEmail = await getAsyncStorageItem("user-email") || "support@martpe.in";

      const body: Record<string, any> = {
        orderId: data._id,
        descriptor: {
          code: issueCode,
          short_desc: IssueTaxonomy[issueLevel as keyof typeof IssueTaxonomy]?.find(
            (item) => item.code === issueCode
          )?.label || "",
          long_desc: description,
        },
        customer: {
          name: userName,
          phone: userPhone,
          email: userEmail,
        },
      };

      // Upload images if any
      if (images.length > 0) {
        const imageUrls = await handleImageUpload(images);
        if (imageUrls.length > 0) {
          body.descriptor.images = imageUrls.map((url: string) => ({
            url,
            size_type: "xs",
          }));
        }
      }

      // Add items if ITEM level issue
      if (issueLevel === "ITEM" && itemId) {
        body.items = [
          {
            catalog_id: itemId,
            qty: data.order_items.find((item) => item.catalog_id === itemId)?.order_qty || 1,
          },
        ];
      }

      const result = await createIssueAction(body as CreateIssueBodyT);
    if (result.success) {
  Alert.alert(
    "Success",
    "Issue created successfully",
    [
      {
        text: "OK",
        onPress: () => {
          onClose();
          if (result.data?._id) {
router.push({
  pathname: '/tickets/[ticketId]',
  params: { ticketId: result.data._id },
});
          }
        },
      },
    ]
  );
}
 else {
        throw new Error(result.error?.message || "Failed to create issue");
      }
    } catch (error) {
      console.error("Error creating issue:", error);
      Alert.alert("Error", "Failed to create issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = issueLevel &&
    (issueLevel !== "ITEM" || itemId) &&
    issueCode &&
    description.trim();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <IssueTypeSelector
          value={issueLevel}
          onChange={(value) => {
            setIssueLevel(value);
            setItemId(""); // Reset item selection when level changes
            setIssueCode(""); // Reset category selection when level changes
          }}
        />

        {issueLevel === "ITEM" && (
          <IssueItemSelector
            items={data.order_items}
            value={itemId}
            onChange={(value: any) => {
              setItemId(value);
              setIssueCode(""); // Reset category when item changes
            }}
          />
        )}

        <IssueCategorySelector
          level={issueLevel}
          itemId={itemId}
          value={issueCode}
          onChange={setIssueCode}
        />

        <IssueDescriptionInput
          value={description}
          onChange={setDescription}
        />

        <IssueImagePicker
          images={images}
          setImages={setImages}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '400',
  },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});