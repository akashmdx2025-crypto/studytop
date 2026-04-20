// source_handbook: week11-hackathon-preparation
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateEmbeddings } from '@/lib/gemini';
import { vectorStore } from '@/lib/vectorstore';

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(10);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Content = (e.target?.result as string).split(',')[1];
      
      try {
        // Step 1: Server processes document (text extraction + chunking)
        setProgress(25);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            content: base64Content,
          }),
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.error) throw new Error(uploadData.error);
        
        // Step 2: Client generates embeddings with Gemini
        setProgress(50);
        const { chunks, stats } = uploadData;
        const textsToEmbed = chunks.map((c: any) => c.text);
        
        const embeddings = await generateEmbeddings(textsToEmbed);
        
        setProgress(90);
        const embeddedChunks = chunks.map((chunk: any, i: number) => ({
          ...chunk,
          embedding: embeddings[i],
        }));

        // Step 3: Local Vector Store indexing
        vectorStore.clear();
        vectorStore.addChunks(embeddedChunks);

        onUploadSuccess({ stats, chunks: embeddedChunks, fileName: file.name });
        setProgress(100);
        toast.success(`Successfully indexed ${file.name}`);
      } catch (error: any) {
        toast.error(`Processing failed: ${error.message}`);
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.readAsDataURL(file);
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md'],
    },
    multiple: false,
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isUploading ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-full"
          >
            <div
              {...getRootProps()}
              className={`
                relative h-full p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-white/[0.02]'}
              `}
            >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                <Upload className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {isDragActive ? 'Drop your file here' : 'Select Study Material'}
                </h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  Drag and drop your PDF, .txt, or .md files. Max 20MB.
                </p>
              </div>
              <Button variant="outline" className="mt-4 rounded-full border-zinc-800 bg-white/5 hover:bg-white/10">
                Browse Files
              </Button>
            </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 border-2 border-zinc-800 bg-white/[0.02] rounded-3xl flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="w-full max-w-xs text-center space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-400">Processing material...</span>
                <span className="text-blue-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
              <p className="text-xs text-zinc-600 italic">
                AI is chunking, embedding, and indexing your content...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
