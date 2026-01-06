import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [vanishAfterSeen, setVanishAfterSeen] = useState(false);
  const fileInputRef = useRef(null);

  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        vanishAfterSeen,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-3 w-full bg-base-100">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-base-300 flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {/* Input */}
        <input
          type="text"
          className="flex-1 input input-bordered rounded-lg text-sm sm:text-base"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* 🖼️ Image button (MOBILE + DESKTOP) */}
        <button
          type="button"
          className={`btn btn-circle min-w-[44px] min-h-[44px] ${
            imagePreview ? "text-emerald-500" : "text-zinc-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </button>

        {/* 👁️ Vanish toggle (MOBILE + DESKTOP) */}
        <button
          type="button"
          className={`btn btn-circle min-w-[44px] min-h-[44px] ${
            vanishAfterSeen ? "text-red-500" : "text-zinc-400"
          }`}
          onClick={() => setVanishAfterSeen((prev) => !prev)}
          title={
            vanishAfterSeen
              ? "Disable disappearing messages"
              : "Enable disappearing messages"
          }
        >
          {vanishAfterSeen ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        {/* ✈️ Send */}
        <button
          type="submit"
          className="btn btn-circle min-w-[44px] min-h-[44px]"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>

      {vanishAfterSeen && (
        <p className="text-[11px] text-red-400 mt-1">
          Disappearing messages enabled
        </p>
      )}
    </div>
  );
};

export default MessageInput;
