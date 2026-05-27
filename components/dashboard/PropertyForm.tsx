'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  Minus,
  Search,
  Upload,
  Sparkles,
  User,
  Check,
  ChevronDown,
  Trash2,
  List,
  ListOrdered,
  FileImage,
  Loader2,
  Calendar,
  Layers,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../ui/image-uploader";
import { uploadPropertyImagesToR2 } from "@/lib/actions/uploads";
import { createProperty } from "@/lib/actions/property-actions";

// ==========================================
// 1. MOCK DATA DEFINITIONS
// ==========================================
const MOCK_ZONES = [
  { id: 1, name: "Mirpur-12", name_bn: "মিরপুর-১২", thana: "Mirpur", city: "Dhaka" },
  { id: 2, name: "Dhanmondi", name_bn: "ধানমন্ডি", thana: "Dhanmondi", city: "Dhaka" },
  { id: 3, name: "Gulshan", name_bn: "গুলশান", thana: "Gulshan", city: "Dhaka" },
  { id: 4, name: "Banani", name_bn: "বনানী", thana: "Banani", city: "Dhaka" },
  { id: 5, name: "Uttara", name_bn: "উত্তরা", thana: "Uttara", city: "Dhaka" },
  { id: 6, name: "Mohammadpur", name_bn: "মোহাম্মদপুর", thana: "Mohammadpur", city: "Dhaka" },
  { id: 7, name: "Badda", name_bn: "বাড্ডা", thana: "Badda", city: "Dhaka" },
  { id: 8, name: "Bashundhara", name_bn: "বসুন্ধরা", thana: "Bashundhara", city: "Dhaka" },
];

const MOCK_USERS = [
  { id: "8f845ac8-596e-468c-9dd1-9d0b368fdd41", name: "Marcus Rivera", phone: "+8801712345678", email: "marcus@rivera.com" },
  { id: "f4208fe8-6efc-4f16-b475-e7888cd8fe8b", name: "Priya Sharma", phone: "+8801812345679", email: "priya@sharma.com" },
  { id: "36b7a1ca-3922-4ef6-b984-9f09ad9529b3", name: "Olivia Chen", phone: "+8801912345680", email: "olivia@chen.com" },
  { id: "5f854070-45c8-4bb2-a41e-6ef9633ca9da", name: "James Park", phone: "+8801512345681", email: "james@park.com" },
  { id: "2bb4c853-2eef-484a-8124-78ab8f370ffb", name: "Eva Martinez", phone: "+8801612345682", email: "eva@martinez.com" },
  { id: "7b25bd93-9bdd-42f6-a78b-1939a3ac407a", name: "Liu Wei", phone: "+8801312345683", email: "liu@wei.com" },
];

// Elegant interior stock images to mock Cloudflare R2 Upload
const UPLOADED_COVER_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
];

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// Custom Rich Text Editor with execCommand and clean UI
function RichTextEditor({
  value,
  onChange,
  placeholder,
  label
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">{label}</Label>
      <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-all shadow-inner">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleCommand('bold')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => handleCommand('italic')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-xs italic text-gray-700 dark:text-gray-300 transition-colors"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => handleCommand('underline')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-xs underline text-gray-700 dark:text-gray-300 transition-colors"
            title="Underline"
          >
            U
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => handleCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
            title="Unordered List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleCommand('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
            title="Ordered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => handleCommand('removeFormat')}
            className="px-2 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-[10px] uppercase font-bold text-red-500 transition-colors"
            title="Clear Formatting"
          >
            Reset
          </button>
        </div>

        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "p-4 min-h-[140px] max-h-[220px] overflow-y-auto outline-none text-sm text-gray-800 dark:text-slate-200 prose dark:prose-invert max-w-none focus:outline-none",
            "before:content-[attr(data-placeholder)] before:text-gray-400 before:pointer-events-none empty:before:block"
          )}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          data-placeholder={placeholder}
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        />
      </div>
    </div>
  );
}

// Multi-select tagging input for Amenities
function TagInput({
  tags,
  onChange,
  placeholder,
  label
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue("");
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">{label}</Label>
      <div className="flex flex-wrap gap-2 p-2.5 border border-gray-200 dark:border-white/10 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-all min-h-[50px] items-center">
        {tags.map((tag, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-100 dark:border-blue-500/25 shadow-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:bg-blue-100 dark:hover:bg-blue-500/25 p-0.5 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add tag..."}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 py-1 min-w-[120px] focus:ring-0"
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Type tag name and press <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">Enter</kbd> to add.</p>
    </div>
  );
}

// ==========================================
// 3. MAIN FORM COMPONENT
// ==========================================
interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (propertyData: any) => void;
}

export default function PropertyForm({ isOpen, onClose, onSuccess }: PropertyFormProps) {
  // Form state structure matching schema columns
  const [formData, setFormData] = useState({
    type: "house", // propertyTypeEnum
    zoneId: "", // zones FK
    price: "", // decimal formatted with commas
    status: "pending", // propertyStatusEnum
    title: "",
    title_bn: "",
    description: "",
    description_bn: "",
    amenities: [] as string[], // jsonb
    amenities_bn: [] as string[], // jsonb
    sizeSqft: "", // integer
    roomCount: 2, // integer stepper
    ownerId: "", // user UUID
    coverImage: "", // R2 image URL
  });

  // Supporting local UI states
  const [loadingZones, setLoadingZones] = useState(true);
  const [zones, setZones] = useState<typeof MOCK_ZONES>([]);
  const [zoneSearch, setZoneSearch] = useState("");
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const zoneDropdownRef = useRef<HTMLDivElement>(null);

  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerResults, setOwnerResults] = useState<typeof MOCK_USERS>([]);
  const [selectedOwner, setSelectedOwner] = useState<typeof MOCK_USERS[0] | null>(null);
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const ownerDropdownRef = useRef<HTMLDivElement>(null);

  const [uploadProgress, setUploadProgress] = useState(-1); // -1 = idle
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coverImageFile, setCoverImageFile] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // To show loading state during submit

  const [privateAddress, setPrivateAddress] = useState({
    house: "", house_bn: "",
    road: "", road_bn: "",
    block: "", block_bn: "",
    landmark: "", landmark_bn: ""
  });

  const [ownerMode, setOwnerMode] = useState<"existing" | "new">("existing");
  const [newOwner, setNewOwner] = useState({
    name: "",
    name_bn: "",
    phone: "",
    whatsapp: ""
  });

  // ----------------------------------------------------
  // USE EFFECTS / SIMULATED DB LIFECYCLES
  // ----------------------------------------------------

  // Fetch zones on component load (Simulation)
  useEffect(() => {
    if (isOpen) {
      setLoadingZones(true);
      const timer = setTimeout(() => {
        setZones(MOCK_ZONES);
        setLoadingZones(false);
      }, 900); // realistic network delay
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click Outside hooks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(event.target as Node)) {
        setIsZoneDropdownOpen(false);
      }
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target as Node)) {
        setIsOwnerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ----------------------------------------------------
  // UX COMMAS PRICE FORMATTING
  // ----------------------------------------------------
  // Bangladeshi Lakh/Crore system: e.g. 150000 -> 1,50,000
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setFormData(prev => ({ ...prev, price: "" }));
      return;
    }

    // South Asian formatting logic
    let lastThree = rawVal.substring(rawVal.length - 3);
    let otherParts = rawVal.substring(0, rawVal.length - 3);
    if (otherParts !== "") {
      lastThree = "," + lastThree;
    }
    const formatted = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    setFormData(prev => ({ ...prev, price: formatted }));
  };

  // ----------------------------------------------------
  // AUTOCOMPLETE SEARCH FOR OWNERS
  // ----------------------------------------------------
  const handleOwnerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setOwnerSearch(query);
    setIsOwnerDropdownOpen(true);

    if (!query.trim()) {
      setOwnerResults([]);
      return;
    }

    // Filter local mock users by name or phone
    const filtered = MOCK_USERS.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.phone.includes(query)
    );
    setOwnerResults(filtered);
  };

  const selectOwner = (user: typeof MOCK_USERS[0]) => {
    setSelectedOwner(user);
    setFormData(prev => ({ ...prev, ownerId: user.id }));
    setOwnerSearch(user.name);
    setIsOwnerDropdownOpen(false);
  };

  // ----------------------------------------------------
  // COVER IMAGE SIMULATED CLOUDFLARE R2 UPLOAD
  // ----------------------------------------------------
  const simulateR2Upload = (file: File) => {
    if (uploading) return;
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Select random premium image URL to mimic result string
            const randomImg = UPLOADED_COVER_IMAGES[Math.floor(Math.random() * UPLOADED_COVER_IMAGES.length)];
            setFormData(prevData => ({ ...prevData, coverImage: randomImg }));
            setUploading(false);
            setUploadProgress(-1);
          }, 400);
          return 100;
        }
        return prev + 12; // fake progress steps
      });
    }, 120);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateR2Upload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateR2Upload(e.target.files[0]);
    }
  };

  // ----------------------------------------------------
  // FORM SUBMISSION
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Strict Validation
    if (!formData.title || !formData.zoneId || coverImageFile.length === 0) {
      alert("Please fill in core fields and cover image.");
      return;
    }

    if (ownerMode === "existing" && !formData.ownerId) {
      alert("Please select an existing owner.");
      return;
    }

    if (ownerMode === "new" && (!newOwner.name || !newOwner.phone)) {
      alert("Please provide the new owner's name and phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Prepare files for Cloudflare R2
      const uploadData = new FormData();
      uploadData.append("cover", coverImageFile[0]);

      // Append all gallery files under the same key
      galleryFiles.forEach((file) => {
        uploadData.append("gallery", file);
      });

      // 3. Upload to R2
      const uploadResult = await uploadPropertyImagesToR2(uploadData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Image upload failed");
      }

      // 4. Merge the R2 URLs with the rest of the form data
      const finalPropertyData = {
        ...formData,
        coverImage: uploadResult.coverUrl,
        galleryUrls: uploadResult.galleryUrls,

        // Pass the new ownership data so the backend can process it!
        ownerMode: ownerMode,
        newOwner: newOwner,
        privateAddress: privateAddress,
      };

      const dbResult = await createProperty(finalPropertyData);
      if (!dbResult.success) {
        throw new Error(dbResult.error);
      }

      // 6. Success! Reset & Close
      if (onSuccess) onSuccess(dbResult);
      onClose();

    } catch (error: any) {
      console.error("Submission Error:", error);
      alert(error.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter zones for searchable zone dropdown
  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(zoneSearch.toLowerCase()) ||
    z.name_bn.includes(zoneSearch)
  );

  const selectedZone = zones.find(z => z.id === Number(formData.zoneId));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Sliding Right Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full md:w-[680px] lg:w-[750px] xl:w-[850px] h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-200 dark:border-white/10 flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-blue-500/5 via-blue-600/5 to-transparent border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    Create Listing
                    <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Add a premium property listing to Jilani Homes.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/15 shadow-sm active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">

              {/* SECTION 1: CORE DETAILS & LOCATION */}
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                    Section 1: Core Details & Location
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Type Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Property Type *</Label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm font-semibold text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="house">🏡 House (Residential)</option>
                        <option value="office">🏢 Office Space</option>
                        <option value="hall">🎭 Event Hall</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Searchable Zone Dropdown (FK FK zones_id_fk) */}
                  <div className="space-y-2" ref={zoneDropdownRef}>
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Zone (FK) *</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                        className={cn(
                          "w-full h-12 px-4 rounded-2xl border text-left text-sm font-semibold flex items-center justify-between bg-white dark:bg-slate-900 transition-all",
                          isZoneDropdownOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-white/10"
                        )}
                      >
                        <span className="truncate flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          {loadingZones ? (
                            <span className="flex items-center gap-2 text-gray-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching zones...
                            </span>
                          ) : selectedZone ? (
                            `${selectedZone.name} | ${selectedZone.name_bn}`
                          ) : (
                            <span className="text-gray-400 font-medium">Select a Searchable Zone</span>
                          )}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isZoneDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
                          >
                            <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center gap-2">
                              <Search className="w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search Mirpur, Gulshan..."
                                value={zoneSearch}
                                onChange={(e) => setZoneSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-gray-400 font-medium text-gray-800 dark:text-slate-200"
                              />
                            </div>

                            <div className="max-h-48 overflow-y-auto p-1 divide-y divide-gray-50 dark:divide-white/5">
                              {loadingZones ? (
                                <div className="p-4 flex flex-col gap-2">
                                  <div className="h-6 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
                                  <div className="h-6 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
                                  <div className="h-6 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
                                </div>
                              ) : filteredZones.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-400 font-semibold">
                                  No zones found.
                                </div>
                              ) : (
                                filteredZones.map((z) => (
                                  <button
                                    type="button"
                                    key={z.id}
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, zoneId: String(z.id) }));
                                      setIsZoneDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-500 flex justify-between items-center transition-colors rounded-xl"
                                  >
                                    <span>{z.name}</span>
                                    <span className="text-gray-400 dark:text-gray-500 font-medium text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{z.name_bn}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Comma Formatted Price */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Price (BDT) *</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 flex items-center pointer-events-none text-blue-500 font-bold text-sm">
                        ৳
                      </div>
                      <Input
                        type="text"
                        value={formData.price}
                        onChange={handlePriceChange}
                        placeholder="e.g. 1,50,000"
                        className="h-12 pl-8 pr-4 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Status *</Label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm font-semibold text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="pending">🟡 Pending Verification</option>
                        <option value="active">🟢 Active Listing</option>
                        <option value="inactive">🔴 Inactive</option>
                        <option value="expired">⌛ Expired</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BILINGUAL CONTENT (EN & BN) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                    Section 2: Bilingual Content (English & Bengali)
                  </h3>
                </div>

                {/* Grid Side-by-Side to Support Translation Without Jumping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* English Columns */}
                  <div className="p-5 rounded-3xl bg-gray-50/50 dark:bg-white/2 border border-gray-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">EN</span>
                      <h4 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">English Details</h4>
                    </div>

                    {/* Title (EN) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Title *</Label>
                      <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Elegant Luxury Penthouse in Gulshan"
                        className="h-11 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-semibold"
                      />
                    </div>

                    {/* Rich Description (EN) */}
                    <RichTextEditor
                      label="Description"
                      value={formData.description}
                      onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                      placeholder="Write descriptive English features..."
                    />

                    {/* Tagging Amenities (EN) */}
                    <TagInput
                      label="Amenities Tags"
                      tags={formData.amenities}
                      onChange={(tags) => setFormData(prev => ({ ...prev, amenities: tags }))}
                      placeholder="Type 'Parking', 'CCTV', 'Lift'..."
                    />
                  </div>

                  {/* Bengali Columns */}
                  <div className="p-5 rounded-3xl bg-gray-50/50 dark:bg-white/2 border border-gray-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full">BN</span>
                      <h4 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Bengali Details</h4>
                    </div>

                    {/* Title (BN) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Title (Bengali)</Label>
                      <Input
                        type="text"
                        value={formData.title_bn}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_bn: e.target.value }))}
                        placeholder="উদা: গুলশানে চমৎকার লাক্সারি পেন্টহাউস"
                        className="h-11 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-semibold"
                      />
                    </div>

                    {/* Rich Description (BN) */}
                    <RichTextEditor
                      label="Description (Bengali)"
                      value={formData.description_bn}
                      onChange={(val) => setFormData(prev => ({ ...prev, description_bn: val }))}
                      placeholder="বাংলায় বর্ণনা ও অন্যান্য বৈশিষ্ট্য লিখুন..."
                    />

                    {/* Tagging Amenities (BN) */}
                    <TagInput
                      label="Amenities Tags (Bengali)"
                      tags={formData.amenities_bn}
                      onChange={(tags) => setFormData(prev => ({ ...prev, amenities_bn: tags }))}
                      placeholder="টাইপ করুন 'পার্কিং', 'সিসিটিভি', 'লিফট'..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SPECIFICATIONS & OWNERSHIP (THE PAYWALL VAULT) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                    Section 3: Specifications & Ownership (Paywall Vault)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Size (size_sqft) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Size (Sq. Ft.)</Label>
                    <Input
                      type="number"
                      value={formData.sizeSqft}
                      onChange={(e) => setFormData(prev => ({ ...prev, sizeSqft: e.target.value }))}
                      placeholder="e.g. 1850"
                      className="h-12 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  {/* Room Count (room_count stepper) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">Room Count</Label>
                    <div className="flex items-center justify-between h-12 px-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, roomCount: Math.max(0, prev.roomCount - 1) }))}
                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors hover:scale-105 active:scale-95"
                      >
                        <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white px-4">{formData.roomCount}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, roomCount: prev.roomCount + 1 }))}
                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors hover:scale-105 active:scale-95"
                      >
                        <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exact Location (Private / Paywall Locked) */}
                <div className="space-y-4 md:col-span-3 p-5 rounded-3xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-red-500 text-white">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 tracking-wider">
                      Exact Address (Hidden behind Paywall)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* House / Flat */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">House/Flat (EN)</Label>
                      <Input value={privateAddress.house} onChange={(e) => setPrivateAddress(prev => ({ ...prev, house: e.target.value }))} placeholder="e.g. Flat 4B, Kazi Villa" className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">House/Flat (BN)</Label>
                      <Input value={privateAddress.house_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, house_bn: e.target.value }))} placeholder="উদা: ফ্ল্যাট ৪বি, কাজী ভিলা" className="h-10 rounded-xl" />
                    </div>

                    {/* Road */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Road (EN)</Label>
                      <Input value={privateAddress.road} onChange={(e) => setPrivateAddress(prev => ({ ...prev, road: e.target.value }))} placeholder="e.g. Road 5" className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Road (BN)</Label>
                      <Input value={privateAddress.road_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, road_bn: e.target.value }))} placeholder="উদা: রোড ৫" className="h-10 rounded-xl" />
                    </div>

                    {/* Block / Sector */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Block/Sector (EN)</Label>
                      <Input value={privateAddress.block} onChange={(e) => setPrivateAddress(prev => ({ ...prev, block: e.target.value }))} placeholder="e.g. Block C" className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Block/Sector (BN)</Label>
                      <Input value={privateAddress.block_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, block_bn: e.target.value }))} placeholder="উদা: ব্লক সি" className="h-10 rounded-xl" />
                    </div>

                    {/* Landmark */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Landmark (EN)</Label>
                      <Input value={privateAddress.landmark} onChange={(e) => setPrivateAddress(prev => ({ ...prev, landmark: e.target.value }))} placeholder="e.g. Beside Boro Masjid" className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Landmark (BN)</Label>
                      <Input value={privateAddress.landmark_bn} onChange={(e) => setPrivateAddress(prev => ({ ...prev, landmark_bn: e.target.value }))} placeholder="উদা: বড় মসজিদের পাশে" className="h-10 rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Owner Selection & Form Section */}
                <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                        Owner Details *
                      </Label>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                        Select a registered owner or record a new profile.
                      </p>
                    </div>

                    {/* Ownership Mode Segment Selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit border border-gray-200/50 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setOwnerMode("existing");
                          setSelectedOwner(null);
                          setFormData(prev => ({ ...prev, ownerId: "" }));
                          setOwnerSearch("");
                        }}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                          ownerMode === "existing"
                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-slate-200"
                        )}
                      >
                        Existing Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOwnerMode("new");
                          setSelectedOwner(null);
                          setFormData(prev => ({ ...prev, ownerId: "" }));
                          setOwnerSearch("");
                        }}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                          ownerMode === "new"
                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-slate-200"
                        )}
                      >
                        New Owner
                      </button>
                    </div>
                  </div>

                  {/* Conditionally Render Form or Search Box */}
                  {ownerMode === "existing" ? (
                    <div className="relative" ref={ownerDropdownRef}>
                      <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={ownerSearch}
                          onChange={handleOwnerSearch}
                          placeholder="Search existing owner by name or phone..."
                          className="h-12 pl-11 pr-10 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-semibold"
                        />
                        {ownerSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setOwnerSearch("");
                              setOwnerResults([]);
                              setSelectedOwner(null);
                              setFormData(prev => ({ ...prev, ownerId: "" }));
                            }}
                            className="absolute right-4 top-3.5 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-950 dark:hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Owner Autocomplete Results */}
                      <AnimatePresence>
                        {isOwnerDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="absolute z-40 w-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
                          >
                            <div className="p-1 divide-y divide-gray-50 dark:divide-white/5">
                              {ownerResults.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-400 font-semibold">
                                  No owners match. Try searching name or phone number.
                                </div>
                              ) : (
                                ownerResults.map((u) => (
                                  <button
                                    type="button"
                                    key={u.id}
                                    onClick={() => selectOwner(u)}
                                    className="w-full text-left px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-500 flex justify-between items-center transition-colors rounded-xl"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-800 dark:text-slate-200">{u.name}</span>
                                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{u.email}</span>
                                    </div>
                                    <span className="text-gray-400 dark:text-gray-500 font-medium text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                      {u.phone}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-3xl bg-gray-50/50 dark:bg-white/2 border border-gray-100 dark:border-white/5"
                    >
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-gray-500 uppercase">Full Name (English) *</Label>
                        <Input
                          value={newOwner.name}
                          onChange={(e) => setNewOwner(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Rahim Uddin"
                          className="h-11 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-gray-500 uppercase">Full Name (Bengali)</Label>
                        <Input
                          value={newOwner.name_bn}
                          onChange={(e) => setNewOwner(prev => ({ ...prev, name_bn: e.target.value }))}
                          placeholder="উদা: রহিম উদ্দিন"
                          className="h-11 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-gray-500 uppercase">Phone Number *</Label>
                        <Input
                          value={newOwner.phone}
                          onChange={(e) => setNewOwner(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="017XXXXXXXX"
                          className="h-11 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-gray-500 uppercase">WhatsApp (Optional)</Label>
                        <Input
                          value={newOwner.whatsapp}
                          onChange={(e) => setNewOwner(prev => ({ ...prev, whatsapp: e.target.value }))}
                          placeholder="017XXXXXXXX"
                          className="h-11 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 font-semibold"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Gorgeous Selected Owner Card */}
                <AnimatePresence>
                  {selectedOwner && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-4.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
                          <Check className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{selectedOwner.name}</h4>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase font-bold tracking-wider">
                              Verified Owner
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Phone: {selectedOwner.phone} &bull; Email: {selectedOwner.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-left md:text-right border-t md:border-t-0 pt-2.5 md:pt-0 border-emerald-500/10">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Database Key (UUID)</p>
                        <p className="text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300 mt-1 truncate max-w-[280px]">
                          {selectedOwner.id}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SECTION 4: MEDIA UPLOAD (DRAG AND DROP CLOUDFLARE R2) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
                  <div className="p-1 rounded-lg bg-sky-500/10 text-sky-500">
                    <FileImage className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                    Section 4: Media Upload
                  </h3>
                </div>

                <ImageUploader
                  label="Cover Image (Single) *"
                  maxFiles={1}
                  value={coverImageFile}
                  onChange={setCoverImageFile}
                />

                <ImageUploader
                  label="Property Gallery (Up to 10 photos)"
                  maxFiles={10}
                  value={galleryFiles}
                  onChange={setGalleryFiles}
                />
              </div>
            </form>

            {/* Sticky Action Footer */}
            <div className="p-6 md:p-8 bg-gray-50 dark:bg-white/2 border-t border-gray-100 dark:border-white/5 flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl border-gray-200 dark:border-white/10 font-bold hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-all active:scale-95"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 hover:scale-[1.02]"
              >
                Save Property
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
