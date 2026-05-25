export async function uploadToR2(
    filename: string,
    file: File,
    options?: {
        onUploadProgress?: (progressEvent: { percentage: number }) => void;
        abortSignal?: AbortSignal;
        handleUploadUrl?: string; // Kept for compatibility with vercel blob options signature
        access?: string; // Kept for compatibility with vercel blob options signature
    }
): Promise<{ url: string }> {
    // 1. Get the presigned URL and public URL from the token endpoint
    const response = await fetch('/api/upload/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename,
            contentType: file.type,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to generate upload token: ${response.statusText}`);
    }

    const { uploadUrl, publicUrl } = await response.json();

    // 2. Upload the file directly to Cloudflare R2 via the presigned PUT URL
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        
        // Custom headers for R2
        xhr.setRequestHeader('Content-Type', file.type);

        if (options?.abortSignal) {
            options.abortSignal.addEventListener('abort', () => {
                xhr.abort();
                reject(new DOMException('Upload aborted', 'AbortError'));
            });
        }

        if (options?.onUploadProgress) {
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentage = Math.round((event.loaded / event.total) * 100);
                    options.onUploadProgress!({ percentage });
                }
            });
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ url: publicUrl });
            } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
    });
}
