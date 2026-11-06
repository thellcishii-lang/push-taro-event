'use client';

import { useCallback, useState, useEffect } from 'react'; // ← useEffect を追加
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase-client';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentUrl?: string;
}

// 画像を自動でリサイズ・圧縮する関数
async function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
  });
}

export default function ImageUploader({ onImageUploaded, currentUrl }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  // 🔴 追加：親側（admin）で送信完了して currentUrl が空になったら、プレビューも自動で消す
  useEffect(() => {
    if (!currentUrl) {
      setPreview(null);
    } else {
      setPreview(currentUrl);
    }
  }, [currentUrl]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      try {
        const compressedBlob = await compressImage(file, 1000, 1000, 0.8);

        const previewUrl = URL.createObjectURL(compressedBlob);
        setPreview(previewUrl);

        const storageRef = ref(storage, `push-images/${Date.now()}_compressed.jpg`);
        await uploadBytes(storageRef, compressedBlob);
        const url = await getDownloadURL(storageRef);
        onImageUploaded(url);
      } catch (err: any) {
        alert('圧縮・アップロード失敗: ' + err.message);
        setPreview(currentUrl || null);
      } finally {
        setUploading(false);
      }
    },
    [onImageUploaded, currentUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '5px',
          fontWeight: 'bold',
        }}
      >
        画像（自動で最適化されます）{uploading && ' - 圧縮・アップロード中...'}
      </label>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img
            src={preview}
            alt="プレビュー"
            style={{ maxWidth: '100%', maxHeight: '200px',objectFit: 'contain', borderRadius: '4px' }}
          />
        ) : (
          <p style={{ margin: 0, color: '#666' }}>
            {isDragActive
              ? 'ここにドロップしてください'
              : 'クリックまたはドラッグ＆ドロップで画像を選択（何MBでもOK！）'}
          </p>
        )}
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
        ※ スマホの写真なども自動で軽いサイズに調整されます
        {currentUrl && !uploading && (
          <span style={{ display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
            URL: {currentUrl}
          </span>
        )}
      </p>
    </div>
  );
}
