import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2, Package, Upload, AlignLeft,
  Loader2, X, Edit2, Save, Plus, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "../constent";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add Product state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "" });

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newEditFiles, setNewEditFiles] = useState([]); // Specifically for NEW files being added
  const [existingImages, setExistingImages] = useState([]); // Specifically for OLD files already on server

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products`);
      setProducts(Array.isArray(res.data) ? res.data : (res.data.products || []));
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileChange = (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    if (isEdit) {
      setNewEditFiles(prev => [...prev, ...files]);
    } else {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setSelectedFiles(prev => [...prev, ...files]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Helper to remove an image from the server list (Local state only until Save)
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to remove a newly selected file before uploading
  const removeNewFile = (index, isEdit = false) => {
    if (isEdit) {
      setNewEditFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) return toast.warning("Please upload at least one image");
    setIsProcessing(true);
    const toastId = toast.loading("Adding product & generating translations...");

    try {
      const formData = new FormData();
      Object.keys(newProduct).forEach(key => formData.append(key, newProduct[key]));
      selectedFiles.forEach(file => formData.append("images", file));

      await axios.post(`${BASE_URL}/api/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setNewProduct({ name: "", price: "", description: "" });
      setSelectedFiles([]);
      setPreviews([]);
      fetchProducts();
      toast.success("Product added!", { id: toastId });
    } catch (err) {
      toast.error("Add failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setIsProcessing(true);
    const toastId = toast.loading("Updating product & translations...");

    try {
      const formData = new FormData();
      formData.append("name", editingProduct.name);
      formData.append("price", editingProduct.price);
      formData.append("description", editingProduct.description);
      
      // 1. Send the list of existing images we want to KEEP
      formData.append("existingImages", JSON.stringify(existingImages));

      // 2. Add any NEW files
      newEditFiles.forEach(file => formData.append("images", file));

      await axios.put(`${BASE_URL}/api/products/${editingProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setIsEditModalOpen(false);
      setNewEditFiles([]);
      fetchProducts();
      toast.success("Changes saved successfully!", { id: toastId });
    } catch (err) {
      toast.error("Update failed. Check backend routes.", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteProduct = async (id, name) => {
    try {
      await axios.delete(`${BASE_URL}/api/products/${id}`);
      fetchProducts();
      toast.success(`${name} removed`);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen pb-20 relative">
      <h1 className="text-2xl font-black mb-8 flex items-center gap-2 text-gray-800">
        <Package className="text-green-600" /> Manage Inventory
      </h1>

      {/* --- ADD FORM --- */}
      <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-3xl shadow-sm border mb-12 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Product Name" className="w-full border p-3 rounded-2xl bg-gray-50" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
          <input placeholder="Price" type="number" className="w-full border p-3 rounded-2xl bg-gray-50" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
        </div>
        <textarea placeholder="English Description" rows="2" className="w-full border p-3 rounded-2xl bg-gray-50" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} required />

        <div className="flex flex-wrap gap-2">
          <label className="w-16 h-16 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <Upload size={16} />
            <input type="file" multiple hidden onChange={handleFileChange} />
          </label>
          {previews.map((src, i) => (
            <div key={i} className="relative group">
               <img src={src} className="w-16 h-16 rounded-xl object-cover border" alt="Preview" />
               <button type="button" onClick={() => removeNewFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                 <X size={12} />
               </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={isProcessing} className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Create Product</>}
        </button>
      </form>

      {/* --- LIST --- */}
      <div className="grid gap-3">
        {products.map(p => (
          <div key={p._id} className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              {/* FIX: Removed BASE_URL because Cloudinary provides the full https:// link */}
              <img 
                src={p.images?.[0] || "https://via.placeholder.com/150?text=No+Image"} 
                className="h-12 w-12 rounded-xl object-cover bg-gray-100" 
                alt={p.name} 
              />
              <div>
                <p className="font-bold text-gray-900">{p.name}</p>
                <p className="text-xs text-green-600 font-bold">₹{p.price}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { 
                  setEditingProduct(p); 
                  setExistingImages(p.images || []); // Set current images
                  setNewEditFiles([]); // Reset new selection
                  setIsEditModalOpen(true); 
                }}
                className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button onClick={() => deleteProduct(p._id, p.name)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-800">Edit Details</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Name</label>
                    <input className="w-full border p-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 ring-green-500" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Price (₹)</label>
                    <input type="number" className="w-full border p-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 ring-green-500" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Current & New Images</label>
                  <div className="flex flex-wrap gap-3">
                    <label className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-green-500 text-gray-400 hover:text-green-500 transition-colors">
                      <Plus size={20} />
                      <input type="file" multiple hidden onChange={(e) => handleFileChange(e, true)} />
                    </label>

                    {/* Show EXISTING images with a delete button */}
                    {existingImages.map((src, i) => (
                      <div key={`old-${i}`} className="relative group">
                        {/* FIX: Removed BASE_URL here too */}
                        <img src={src} className="w-16 h-16 rounded-2xl object-cover border shadow-sm" alt="Existing" />
                        <button onClick={() => removeExistingImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    ))}

                    {/* Show NEWLY selected files */}
                    {newEditFiles.map((file, i) => (
                      <div key={`new-${i}`} className="relative group">
                        <img src={URL.createObjectURL(file)} className="w-16 h-16 rounded-2xl object-cover border border-green-400 shadow-sm" alt="New" />
                        <button onClick={() => removeNewFile(i, true)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-100">
                          <X size={10} />
                        </button>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold">NEW</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1"><AlignLeft size={12} /> English Description</label>
                  <textarea rows="4" className="w-full border p-4 rounded-2xl bg-white outline-none focus:ring-2 ring-green-500 text-sm" value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                </div>
              </div>

              <button onClick={handleUpdateProduct} disabled={isProcessing} className="w-full bg-black text-white p-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-gray-800 transition-all disabled:opacity-70">
                {isProcessing ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}