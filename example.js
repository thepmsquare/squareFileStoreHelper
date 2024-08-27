import SquareFileStoreHelper from "./dist/index.js";

const createSampleFile = () => {
  const content = "This is a sample text file content.";
  const blob = new Blob([content], { type: "text/plain" });
  const file = new File([blob], "sample.txt", { type: "text/plain" });
  return file;
};
const squareFileStoreHelper = new SquareFileStoreHelper();
// upload file
let uploadResponse = await squareFileStoreHelper.uploadFile(createSampleFile());
let uploadedToken = uploadResponse.additional_info.FileStorageToken;
console.log(uploadResponse);

// download file
let downloadResponse = await squareFileStoreHelper.downloadFile(uploadedToken);
console.log(downloadResponse);
