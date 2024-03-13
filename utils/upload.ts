import { createClient } from "./supabase/client";
type media = {
  name: string;
  data:
    | string
    | ArrayBuffer
    | Blob
    | File
    | FormData
    | URLSearchParams
    | ReadableStream<Uint8Array>
    | null;
  // video
  duration?: number;
  // image
  width?: number;
  height?: number;
  // audio
  channels?: number;
  sampleRate?: number;
  bitDepth?: number;
  // pdf
  pageCount?: number;
};

type mediaType = "image" | "video" | "audio" | "pdf";

type mediaUpload = {
  type: mediaType;
  media: media;
};

const upload = async ({
  file,
  bucket,
}: {
  file: mediaUpload;
  bucket: string;
}) => {
  const supabase = createClient();
  const { name, data: fileData } = file.media;
  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(name, fileData, { upsert: true });
    console.log(data)
  const {
    data: { publicUrl },
  } = await supabase.storage.from(bucket).getPublicUrl(name);
  console.log(publicUrl)
  if (uploadError) {
    throw uploadError;
  }
  return publicUrl;
};

export { upload };
