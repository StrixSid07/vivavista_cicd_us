import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Alert,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import axios from "@/utils/axiosInstance";

export function ManageDealExternal() {
  const [file, setFile] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [openAlert, setOpenAlert] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [deals, setDeals] = useState([]);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);

  // Fetch all deals for the dropdown
  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoadingDeals(true);
      try {
        const response = await axios.get('/deals');
        if (response.data && Array.isArray(response.data)) {
          setDeals(response.data);
        } else {
          console.error("Invalid deals data format:", response.data);
          setDeals([]);
        }
      } catch (error) {
        console.error("Error fetching deals:", error);
        setMessage({
          type: "error",
          text: "Error loading deals. Please refresh the page."
        });
        setOpenAlert(true);
        setDeals([]);
      } finally {
        setIsLoadingDeals(false);
      }
    };

    fetchDeals();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (
      selected &&
      selected.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFile(selected);
      setMessage({ type: "", text: "" });
    } else {
      setFile(null);
      setMessage({
        type: "error",
        text: "Only Excel (.xlsx) files are allowed.",
      });
      setOpenAlert(true);
    }
  };

  // Add this function to clear the file input
  const handleClearFile = () => {
    setFile(null);
    // Reset the file input element by creating a ref
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
    setMessage({ type: "info", text: "File selection cleared" });
    setOpenAlert(true);
  };

  const handleUpload = async (endpoint) => {
    if (!file) {
      setMessage({ type: "error", text: "Please select an Excel file first." });
      setOpenAlert(true);
      return;
    }

    // For price-only upload, ensure a deal is selected
    if (endpoint === "upload-price-only" && !selectedDealId) {
      setMessage({ 
        type: "error", 
        text: "Please select a deal for the price upload." 
      });
      setOpenAlert(true);
      return;
    }

    // Prevent duplicate submissions
    if (uploadingType) return;

    const formData = new FormData();
    formData.append("file", file);
    
    // Add dealId for price-only upload
    if (endpoint === "upload-price-only") {
      formData.append("dealId", selectedDealId);
    }

    setUploadingType(endpoint);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post(
        `/admindealsexternal/${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // For price-only upload or bulk-upload-price, show detailed results
      if ((endpoint === "upload-price-only" || endpoint === "bulk-upload-price") && res.data) {
        // Prepare results for the dialog
        const results = {
          success: res.data.success,
          message: res.data.message,
          addedCount: res.data.updatedDeals || 0,
          updatedCount: 0,
          errorCount: res.data.skippedDuplicates || 0,
          errors: []
        };
        
        // Process skipped duplicates as errors for display
        if (res.data.results && Array.isArray(res.data.results)) {
          results.errors = res.data.results
            .filter(item => item.status === "skipped")
            .map(item => ({
              row: JSON.stringify(item.row),
              error: item.message
            }));
        }
        
        setUploadResults(results);
        setOpenResultDialog(true);
      } else {
        setMessage({
          type: "success",
          text: res?.data?.message || "Upload successful!",
        });
        setOpenAlert(true);
      }
      
      // Clear the file input after successful upload
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message || "Upload failed. Please try again.",
      });
      setOpenAlert(true);
    } finally {
      setUploadingType(null);
    }
  };

  const downloadFile = async (endpoint, filename) => {
    if (downloadInProgress || buttonDisabled) return;
    
    setButtonDisabled(true);
    setDownloadInProgress(true);
    
    try {
      const res = await axios.get(`/admindealsexternal/${endpoint}`, {
        responseType: "blob",
      });

      if (res.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url); // Clean up
      }
    } catch (error) {
      console.error("Download error:", error);
      setMessage({
        type: "error",
        text: "Download failed. Please try again.",
      });
      setOpenAlert(true);
    } finally {
      setDownloadInProgress(false);
      setTimeout(() => setButtonDisabled(false), 500);
    }
  };

  const isUploading = (endpoint) => uploadingType === endpoint;

  // Add function to handle closing the result dialog
  const handleCloseResultDialog = () => {
    setOpenResultDialog(false);
    setUploadResults(null);
  };

  useEffect(() => {
    if (message.text) {
      setOpenAlert(true);
      const timer = setTimeout(() => {
        setOpenAlert(false);
        setMessage({ text: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Safe find function to prevent errors
  const getSelectedDealTitle = () => {
    if (!selectedDealId || !deals || !Array.isArray(deals)) return "";
    const deal = deals.find(d => d && d._id === selectedDealId);
    return deal ? deal.title : "";
  };

  return (
    <Card className="h-full min-h-[80vh] w-full shadow-lg">
      <CardBody className="space-y-6">
        <Typography variant="h4">Manage External Deals</Typography>

        <Alert
          open={openAlert}
          onClose={() => setOpenAlert(false)}
          animate={{ mount: { y: 0 }, unmount: { y: 100 } }}
          color={
            message.type === "success" 
              ? "green" 
              : message.type === "info" 
                ? "blue" 
                : "red"
          }
        >
          {message.text}
        </Alert>

        {/* ---------- SECTION: Downloads ---------- */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray">
            Download Templates
          </Typography>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {/* Temporarily commented out
            <Button
              color="blue"
              onClick={() => downloadFile("template", "DealsTemplate.xlsx")}
              disabled={downloadInProgress || buttonDisabled}
            >
              {downloadInProgress ? <Spinner className="h-4 w-4" /> : "Download Deals Template"}
            </Button>
            <Button
              color="green"
              onClick={() => downloadFile("download-all", "AllDeals.xlsx")}
              disabled={downloadInProgress || buttonDisabled}
            >
              {downloadInProgress ? <Spinner className="h-4 w-4" /> : "Download All Deals"}
            </Button>
            <Button
              color="teal"
              onClick={() =>
                downloadFile("price-template", "DealPriceTemplate.xlsx")
              }
              disabled={downloadInProgress || buttonDisabled}
            >
              {downloadInProgress ? <Spinner className="h-4 w-4" /> : "Download Price Template"}
            </Button>
            */}
            <Button
              color="amber"
              onClick={() =>
                downloadFile("price-only-template", "PriceOnlyTemplate.xlsx")
              }
              disabled={downloadInProgress || buttonDisabled}
              className="font-semibold"
            >
              {downloadInProgress ? <Spinner className="h-4 w-4" /> : "Download Price-Only Template"}
              <span className="block text-xs mt-1 text-amber-800">No deal selection required</span>
            </Button>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* ---------- SECTION: File Upload ---------- */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray">
            Upload Excel File
          </Typography>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                required
                className="block w-full max-w-xs text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
                disabled={uploadingType !== null}
              />
              <Button
                color="red"
                onClick={handleClearFile}
                disabled={uploadingType !== null || !file}
                size="sm"
                className="mt-2 sm:mt-0"
              >
                Clear
              </Button>
            </div>
            
            {file && (
              <div className="flex items-center mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <Typography variant="small" className="font-medium">
                  Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
                </Typography>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* ---------- SECTION: Deal Selection for Price-Only Upload ---------- */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray">
            Deal Selection (For Price-Only Upload)
          </Typography>
          <div className="w-full max-w-md">
            {selectedDealId && (
              <div className="mb-2 p-2 bg-blue-50 rounded-md">
                <Typography variant="small" className="font-semibold">
                  Selected Deal: {getSelectedDealTitle()}
                </Typography>
              </div>
            )}
            
            <div className="relative">
              <Select
                label="Select Deal"
                value={selectedDealId}
                onChange={val => val && setSelectedDealId(val)}
                disabled={isLoadingDeals || uploadingType !== null}
                variant="outlined"
              >
                {isLoadingDeals ? (
                  <Option key="loading" value="" disabled>
                    Loading deals...
                  </Option>
                ) : deals.length === 0 ? (
                  <Option key="none" value="" disabled>
                    No deals available
                  </Option>
                ) : (
                  deals.map((deal) => (
                    deal && deal._id ? (
                      <Option 
                        key={deal._id} 
                        value={deal._id}
                      >
                        {deal.title || "Untitled Deal"}
                      </Option>
                    ) : null
                  ))
                )}
              </Select>
            </div>
            
            <Typography variant="small" color="blue-gray" className="mt-2 italic">
              Required only for the "Upload Price-Only Data" action
            </Typography>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* ---------- SECTION: Upload Actions ---------- */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray">
            Upload Actions
          </Typography>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {/* Temporarily commented out
            <Button
              onClick={() => handleUpload("bulk-upload")}
              disabled={isUploading("bulk-upload") || isUploading("bulk-update") || isUploading("bulk-upload-price") || isUploading("bulk-upload-update") || isUploading("upload-price-only")}
              color="purple"
            >
              {isUploading("bulk-upload") ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Bulk Upload Deals"
              )}
            </Button>

            <Button
              onClick={() => handleUpload("bulk-update")}
              disabled={isUploading("bulk-update") || isUploading("bulk-upload") || isUploading("bulk-upload-price") || isUploading("bulk-upload-update") || isUploading("upload-price-only")}
              color="deep-purple"
            >
              {isUploading("bulk-update") ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Bulk Update Deals"
              )}
            </Button>

            <Button
              onClick={() => handleUpload("bulk-upload-price")}
              disabled={isUploading("bulk-upload-price") || isUploading("bulk-upload") || isUploading("bulk-update") || isUploading("bulk-upload-update") || isUploading("upload-price-only")}
              color="cyan"
            >
              {isUploading("bulk-upload-price") ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Bulk Upload Prices"
              )}
            </Button>
            
            <Button
              onClick={() => handleUpload("bulk-upload-update")}
              disabled={isUploading("bulk-upload-update") || isUploading("bulk-upload") || isUploading("bulk-update") || isUploading("bulk-upload-price") || isUploading("upload-price-only")}
              color="indigo"
            >
              {isUploading("bulk-upload-update") ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Upload + Update Prices"
              )}
            </Button>
            */}

            <Button
              onClick={() => handleUpload("upload-price-only")}
              disabled={isUploading("upload-price-only") || isUploading("bulk-upload") || isUploading("bulk-update") || isUploading("bulk-upload-price") || isUploading("bulk-upload-update")}
              color="amber"
            >
              {isUploading("upload-price-only") ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Upload Price-Only Data"
              )}
            </Button>
          </div>
        </div>

        {/* Upload Results Dialog */}
        <Dialog 
          open={openResultDialog} 
          handler={handleCloseResultDialog} 
          size="lg"
        >
          <DialogHeader>Upload Results</DialogHeader>
          <DialogBody divider className="max-h-[70vh] overflow-auto">
            {uploadResults && (
              <div className="space-y-4">
                <Alert color={uploadResults.success ? "green" : "red"}>
                  {uploadResults.message || "Upload completed"}
                </Alert>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded shadow text-center">
                    <Typography variant="h5" color="green">{uploadResults.addedCount || 0}</Typography>
                    <Typography variant="small">Prices Added</Typography>
                  </div>
                  <div className="bg-blue-50 p-3 rounded shadow text-center">
                    <Typography variant="h5" color="blue">{uploadResults.updatedCount || 0}</Typography>
                    <Typography variant="small">Prices Updated</Typography>
                  </div>
                  <div className="bg-red-50 p-3 rounded shadow text-center">
                    <Typography variant="h5" color="red">{uploadResults.errorCount || 0}</Typography>
                    <Typography variant="small">Errors</Typography>
                  </div>

                </div>

                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <div className="mt-4">
                    <Typography variant="h6" color="red">Error Details</Typography>
                    <div className="border border-red-200 rounded-lg overflow-hidden mt-2">
                      <table className="w-full text-sm">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Row Data</th>
                            <th className="px-4 py-2 text-left">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.errors.map((error, index) => (
                            <tr key={index} className="border-t border-red-200">
                              <td className="px-4 py-2 align-top">
                                <pre className="whitespace-pre-wrap text-xs">
                                  {error.row || "Unknown data"}
                                </pre>
                              </td>
                              <td className="px-4 py-2 align-top text-red-500">
                                {error.error || "Unknown error"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button onClick={handleCloseResultDialog} color="blue">
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      </CardBody>
    </Card>
  );
}

export default ManageDealExternal;

