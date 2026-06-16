import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Loader2, CheckCircle, FolderPlus, FileText, Search, Trash2, Video, Link as LinkIcon, PlayCircle } from 'lucide-react';

export default function ManageMaterials() {
  // FORM STATE
  const [materialType, setMaterialType] = useState('text'); // 'text' or 'video'
  const [formData, setFormData] = useState({
    class_name: 'Basic 5',
    subject: 'Basic Science',
    topic: '',
    content_text: '',
    video_url: '' // Added for video section
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // REPOSITORY STATE
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [fetching, setFetching] = useState(true);

  // Load existing materials from backend
  const fetchMaterials = async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:8000/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log("Could not load materials.", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Prepare payload (if it's a video, we pass the URL into the text content or a dedicated field depending on your backend)
    const payload = {
      ...formData,
      content_text: materialType === 'video' ? `VIDEO_LINK: ${formData.video_url}` : formData.content_text
    };

    try {
      const response = await fetch("http://localhost:8000/materials/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ ...formData, topic: '', content_text: '', video_url: '' });
        fetchMaterials();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        alert("Failed to save course material. Check backend console.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Make sure your FastAPI Docker container is running!");
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term AND material type
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.topic?.toLowerCase().includes(searchTerm.toLowerCase()) || m.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const isVideo = m.content_text?.includes('VIDEO_LINK:');

    if (activeTab === 'video') return matchesSearch && isVideo;
    if (activeTab === 'text') return matchesSearch && !isVideo;
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto mb-10 animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <BookOpen className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lesson Repository</h1>
          <p className="text-sm font-bold text-slate-500">Upload curriculum text and video links for student access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Upload Form */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-600 sticky top-24">
            <h2 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-slate-700">
              <FolderPlus size={18} className="text-blue-600" /> Upload Lesson
            </h2>

            {success && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg mb-6 text-sm font-bold flex items-center gap-2 border border-emerald-200 animate-in fade-in duration-200">
                <CheckCircle size={16} /> Saved to Database!
              </div>
            )}

            {/* Type Selector (Text vs Video) */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMaterialType('text')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all ${materialType === 'text' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileText size={16} /> AI Text
              </button>
              <button
                type="button"
                onClick={() => setMaterialType('video')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all ${materialType === 'video' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Video size={16} /> Video Link
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Class Tier</label>
                  <select
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:border-blue-500 outline-none bg-slate-50"
                  >
                    {['Nursery 1', 'Nursery 2', 'KG 1', 'KG 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5'].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text" name="subject" required
                    value={formData.subject} onChange={handleInputChange}
                    placeholder="e.g. Science"
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Topic</label>
                <input
                  type="text" name="topic" required
                  value={formData.topic} onChange={handleInputChange}
                  placeholder="e.g., Photosynthesis"
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm font-bold focus:border-blue-500 outline-none"
                />
              </div>

              {/* Dynamic Input based on selection */}
              {materialType === 'text' ? (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Lesson Text Content</label>
                  <textarea
                    name="content_text" required rows="8"
                    value={formData.content_text} onChange={handleInputChange}
                    placeholder="Paste the textbook chapter or lesson notes here for AI processing..."
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:border-blue-500 outline-none font-sans leading-relaxed resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">YouTube / Video URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="url" name="video_url" required
                      value={formData.video_url} onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full pl-10 pr-3 py-3 border border-slate-200 bg-slate-50 rounded-lg text-sm font-bold focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${materialType === 'text' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Publish {materialType === 'text' ? 'Notes' : 'Video'}</>}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Repository Grid */}
        <div className="xl:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-full flex flex-col">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['all', 'text', 'video'].map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${activeTab === type ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search topic or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {fetching ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-50">
                <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                <p className="font-bold text-slate-500">Loading database records...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-60">
                <BookOpen size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-black text-slate-700 uppercase tracking-wider mb-1">Database Empty</h3>
                <p className="text-sm font-bold text-slate-500">No materials match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMaterials.map((item, idx) => {
                  const isVideo = item.content_text?.includes('VIDEO_LINK:');

                  return (
                    <div key={idx} className="border border-slate-200 bg-slate-50 hover:bg-white rounded-xl p-5 hover:shadow-md transition-all group flex flex-col cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-lg ${isVideo ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                          {isVideo ? <Video size={20} /> : <FileText size={20} />}
                        </div>
                        <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider rounded-md">
                          {item.class_name || 'Class'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{item.topic}</h3>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isVideo ? 'text-rose-600' : 'text-blue-600'}`}>{item.subject}</p>

                      <div className="mt-auto pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          {isVideo ? <><PlayCircle size={12} /> Video Lesson</> : <>{item.content_text?.length || 0} Chars</>}
                        </span>
                        <button className="text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}