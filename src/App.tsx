import Tesseract from 'tesseract.js';
import {
  UploadCloud,
  Copy,
  Download,
  Image as ImageIcon,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Loader2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';

export default function App() {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      await processFile(droppedFile);
    } else {
      setError("Please drop a valid image file (JPG, PNG, WebP).");
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setExtractedText(null);
    setError(null);
    setIsConverting(true);

    // Create thumbnail
    const reader = new FileReader();
    reader.onload = (e) => setThumbnail(e.target?.result as string);
    reader.readAsDataURL(selectedFile);

    try {
      const result = await Tesseract.recognize(
        selectedFile,
        'eng',
        { logger: m => console.log(m) }
      );

      setExtractedText(result.data.text || 'No text found in the image.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract text. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen w-full bg-[#0B0F19] text-[#E5E7EB] overflow-hidden font-sans selection:bg-[#3B82F6]/30 selection:text-[#60A5FA] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 border-b border-[#1F2937] shrink-0">
        <div className="text-xl sm:text-2xl font-black tracking-tighter text-[#3B82F6] flex items-center gap-2">
          <FileText className="w-6 h-6" />
          TextExtractor
        </div>
        <nav className="hidden sm:flex gap-6 sm:gap-10 text-xs sm:text-sm font-semibold tracking-wide uppercase text-[#9CA3AF]">
          <a href="#how-it-works" className="hover:text-[#60A5FA] transition-colors">How it Works</a>
          <a href="#features" className="hover:text-[#60A5FA] transition-colors">Features</a>
          <a href="#contact" className="hover:text-[#60A5FA] transition-colors">Contact</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-y-auto lg:overflow-hidden no-scrollbar">
        {/* Left Column: Tool & Headline */}
        <section className="w-full lg:w-[65%] p-6 sm:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#1F2937] overflow-y-auto no-scrollbar">
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1] tracking-tight mb-4 text-[#F3F4F6]"
            >
              Extract Text from <span className="text-[#3B82F6]">Any Image</span> Instantly.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#9CA3AF] leading-relaxed max-w-lg"
            >
              A 100% free, highly accurate OCR tool. No signup required. Just drop your image and copy your text.
            </motion.p>
          </div>

          {/* Tool Area */}
          <div className="bg-[#111827] border-2 border-dashed border-[#3B82F6]/50 rounded-2xl p-4 sm:p-6 relative overflow-hidden shrink-0 w-full max-w-3xl">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            
            <AnimatePresence mode="wait">
              {(!file || error) ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    cursor-pointer group relative overflow-hidden
                    flex flex-col items-center justify-center
                    w-full h-[252px] rounded-xl
                    transition-all duration-200 ease-out
                    ${isHovering ? 'bg-[#3B82F6]/10' : 'bg-transparent hover:bg-[#1F2937]/50'}
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`p-4 rounded-full mb-4 transition-colors ${isHovering ? 'bg-[#3B82F6]/20 text-[#60A5FA]' : 'bg-[#1F2937] shadow-sm text-[#9CA3AF] group-hover:text-[#60A5FA] group-hover:shadow'}`}>
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#F3F4F6] mb-2">
                    Drag & Drop your image here
                  </h3>
                  <p className="text-[#9CA3AF] mb-4">
                    or <span className="text-[#60A5FA] font-medium group-hover:underline">Browse Files</span>
                  </p>
                  <p className="text-xs text-[#6B7280] font-medium tracking-wide">
                    SUPPORTS JPG, PNG, WEBP
                  </p>
                  {error && (
                    <div className="absolute bottom-6 px-4 py-2 bg-red-500/10 text-red-400 text-sm font-medium rounded-full border border-red-500/20">
                      {error}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row gap-6 h-auto sm:h-[300px]"
                >
                  {/* Image Preview */}
                  <div className="w-full sm:w-1/2 bg-[#1F2937] rounded-xl overflow-hidden relative border border-[#374151] flex flex-col">
                    <div className="absolute top-2 left-2 z-10 flex gap-2">
                       <button
                         onClick={() => {
                           setFile(null);
                           setExtractedText(null);
                           setThumbnail(null);
                         }}
                         className="bg-[#111827]/80 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded shadow-sm hover:bg-[#111827] text-[#D1D5DB] uppercase border border-[#374151]"
                       >
                         Clear
                       </button>
                    </div>
                    {extractedText && !isConverting && (
                      <div className="absolute top-2 right-2 z-10 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">SCANNED</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      {thumbnail ? (
                         <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-contain drop-shadow-md" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-[#4B5563]" />
                      )}
                    </div>
                  </div>

                  {/* Extraction Output */}
                  <div className="w-full sm:w-1/2 flex flex-col">
                    <div className="flex-1 bg-[#111827] border border-[#374151] rounded-xl p-4 text-sm font-mono overflow-auto leading-relaxed relative text-[#E5E7EB] no-scrollbar">
                      {isConverting && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#60A5FA] bg-[#111827]/80 backdrop-blur-sm z-10">
                          <Loader2 className="w-8 h-8 animate-spin mb-4" />
                          <p className="font-bold text-xs uppercase tracking-widest text-[#60A5FA]">Scanning...</p>
                        </div>
                      )}
                      
                      <textarea 
                        value={extractedText || ''}
                        readOnly
                        placeholder="Extracted text will appear here..."
                        className="w-full h-full bg-transparent outline-none resize-none text-[#E5E7EB] placeholder-[#6B7280]"
                      />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={handleCopy}
                        disabled={!extractedText || isConverting}
                        className="flex-1 bg-[#3B82F6] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#2563EB] active:scale-95 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                      >
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                      <button 
                         onClick={handleDownload}
                         disabled={!extractedText || isConverting}
                         className="px-4 bg-[#1F2937] border border-[#374151] py-3 rounded-lg hover:bg-[#374151] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         title="Download .txt"
                      >
                        <Download className="w-5 h-5 text-[#D1D5DB]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-2 right-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest z-0 pointer-events-none">
              Supports: JPG, PNG, WEBP
            </div>
          </div>
        </section>

        {/* Right Column: Features & Steps */}
        <aside className="w-full lg:w-[35%] bg-[#111827] flex flex-col overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#1F2937] no-scrollbar">
          {/* How It Works */}
          <div className="p-6 md:p-10 border-b border-[#1F2937] shrink-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#6B7280] mb-6">How It Works</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-[#1F2937] w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#60A5FA] border border-[#374151] flex-shrink-0">1</div>
                <p className="text-sm text-[#9CA3AF]"><strong className="text-[#F3F4F6]">Upload:</strong> Drag & drop your image or browse files from your device.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-[#1F2937] w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#60A5FA] border border-[#374151] flex-shrink-0">2</div>
                <p className="text-sm text-[#9CA3AF]"><strong className="text-[#F3F4F6]">Extract:</strong> Our proprietary AI instantly scans and identifies text characters.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-[#1F2937] w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#60A5FA] border border-[#374151] flex-shrink-0">3</div>
                <p className="text-sm text-[#9CA3AF]"><strong className="text-[#F3F4F6]">Copy:</strong> Download the result or copy it directly to your clipboard.</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="p-6 md:p-10 flex flex-col gap-6 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#6B7280]">Why TextExtractor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151]">
                <div className="text-[#60A5FA] mb-2"><CheckCircle2 className="w-5 h-5" /></div>
                <h4 className="text-xs font-bold mb-1 text-[#F3F4F6]">100% Free</h4>
                <p className="text-[10px] text-[#9CA3AF]">No hidden fees ever.</p>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151]">
                <div className="text-[#60A5FA] mb-2"><ShieldCheck className="w-5 h-5" /></div>
                <h4 className="text-xs font-bold mb-1 text-[#F3F4F6]">No Login</h4>
                <p className="text-[10px] text-[#9CA3AF]">No signup required.</p>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151]">
                <div className="text-[#60A5FA] mb-2"><Globe className="w-5 h-5" /></div>
                <h4 className="text-xs font-bold mb-1 text-[#F3F4F6]">High Accuracy</h4>
                <p className="text-[10px] text-[#9CA3AF]">AI-powered recognition.</p>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151]">
                <div className="text-[#60A5FA] mb-2"><Zap className="w-5 h-5" /></div>
                <h4 className="text-xs font-bold mb-1 text-[#F3F4F6]">Instant Result</h4>
                <p className="text-[10px] text-[#9CA3AF]">Milliseconds extraction.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-4 flex flex-col sm:flex-row justify-between items-center bg-[#0B0F19] border-t border-[#1F2937] text-[11px] text-[#6B7280] uppercase tracking-widest font-bold shrink-0 gap-4 sm:gap-0">
        <div>&copy; {currentYear} Textextractor.com — All rights reserved.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#60A5FA] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#60A5FA] transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

