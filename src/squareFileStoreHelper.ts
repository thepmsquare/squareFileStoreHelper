import { UploadResponse } from "./types/SquareFileStoreHelper.js";

class SquareFileStoreHelper {
  private squareFileStoreUrl: string;

  constructor(
    squareFileStoreProtocol: string = "http",
    squareFileStoreIp: string = "localhost",
    squareFileStorePort: string = "10100"
  ) {
    this.squareFileStoreUrl = `${squareFileStoreProtocol}://${squareFileStoreIp}:${squareFileStorePort}`;
  }

  /**
   * Upload a file to the server.
   * @param file - The file to be uploaded.
   * @param appId - Optional app id.
   * @param systemRelativePath - Optional system path where the file should be stored.
   * @returns The server response, including a FileStorageToken.
   */
  public async uploadFile(
    file: File | Blob,
    appId?: number,
    systemRelativePath?: string
  ): Promise<UploadResponse | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (appId) {
        formData.append("app_id", appId.toString());
      }

      if (systemRelativePath) {
        formData.append("system_relative_path", systemRelativePath);
      }

      const response = await fetch(`${this.squareFileStoreUrl}/upload_file`, {
        method: "POST",
        body: formData,
      });

      this.logResponse(response);

      if (response.ok) {
        const result: UploadResponse = await response.json();
        return result;
      } else {
        console.error("Failed to upload file:", response.statusText);
        return null;
      }
    } catch (error) {
      this.handleError("uploadFile", error);
      return null;
    }
  }

  /**
   * Download a file from the server using a file storage token.
   * @param fileStorageToken - The token to retrieve the file.
   * @returns An object containing the file Blob and filename.
   */
  public async downloadFile(
    fileStorageToken: string
  ): Promise<{ blob: Blob; filename: string } | null> {
    try {
      const downloadUrl = this.constructDownloadUrl(fileStorageToken);
      const response = await fetch(downloadUrl);

      if (response.ok) {
        const filename = this.extractFilename(response) || "downloaded_file";
        const blob = await response.blob();

        return { blob, filename };
      } else {
        throw new Error(
          `Invalid status from download endpoint. URL: ${downloadUrl}, Status: ${response.status}`
        );
      }
    } catch (error) {
      this.handleError("downloadFile", error);
      return null;
    }
  }

  // Private methods for internal utility

  private logResponse(response: Response): void {
    if (!response.ok) {
      console.error(`Response Error: ${response.statusText}`);
    }
  }

  private handleError(methodName: string, error: unknown): void {
    console.error(`Error in ${methodName}:`, error);
  }

  private constructDownloadUrl(fileStorageToken: string): string {
    return `${this.squareFileStoreUrl}/download_file?file_storage_token=${fileStorageToken}`;
  }

  private extractFilename(response: Response): string | null {
    const contentDisposition = response.headers.get("Content-Disposition");
    const match =
      contentDisposition && contentDisposition.match(/filename="(.+?)"/);
    return match ? match[1] : null;
  }
}

export default SquareFileStoreHelper;
