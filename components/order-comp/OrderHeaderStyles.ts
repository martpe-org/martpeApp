import { Platform } from "react-native";
import { StyleSheet, Dimensions } from "react-native";
const { height: screenHeight } = Dimensions.get('window');
 export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e5ebf1ff',
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop:10,
    marginHorizontal:8,
    borderRadius:15
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeLogoContainer: {
    marginRight: 12,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  storeAddress: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 5,
    shadowColor: '#080808ff',
    borderRadius: 26,
    backgroundColor: '#bdcaf5ff',
    marginLeft: 10,
  },
  helpText: {
    fontSize: 12,
    color: '#0f0f0fff',
    marginLeft: 0,
    fontWeight: '500',
  },

  orderInfoSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#374151",
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  refreshButton: {
    backgroundColor: "#ef4444",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 14,
  },
  // Modal styles
  // Enhanced Modern Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modernModalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Handle safe area
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modernModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 20,

  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  modernModalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  modernCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  modernModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom:60
  },
// Add these styles to your OrderHeaderStyles file
tabContainer: {
  flexDirection: 'row',
  backgroundColor: '#ffffff',
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
  paddingHorizontal: 16,
},
tabButton: {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: 'center',
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
},
activeTab: {
  borderBottomColor: '#3b82f6', // Blue color for active tab
},
tabText: {
  fontSize: 16,
  fontWeight: '500',
  color: '#6b7280',
},
activeTabText: {
  color: '#1f2937',
  fontWeight: '600',
},

trackSection: {
  padding: 16,
  backgroundColor: '#ffffff',
  minHeight: 200,
},
trackingText: {
  fontSize: 16,
  color: '#6b7280',
  textAlign: 'center',
  marginTop: 50,
},

});