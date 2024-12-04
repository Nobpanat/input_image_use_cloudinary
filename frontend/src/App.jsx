import { useState } from "react";
import axios from "axios";
import "./App.css"; 

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ฟังก์ชันสำหรับจัดการการเลือกไฟล์
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // สร้างพรีวิวรูปภาพ
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ฟังก์ชันสำหรับอัปโหลดไฟล์
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true); // ตั้งสถานะการอัปโหลด

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadedImage(res.data.image.url); // เก็บ URL ของรูปภาพที่อัปโหลดสำเร็จ
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading the image:", error);
      alert("Image upload failed!");
    } finally {
      setIsUploading(false); // ยกเลิกสถานะการอัปโหลด
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Upload Image to Cloudinary</h1>

      <div className="upload-container">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="file-input"
        />
        <button
          onClick={handleFileUpload}
          className="upload-button"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {preview && (
        <div className="preview-container">
          <h2>Image Preview:</h2>
          <img src={preview} alt="Preview" className="preview-image" />
        </div>
      )}

      {uploadedImage && (
        <div className="uploaded-container">
          <h2>Uploaded Image:</h2>
          <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
        </div>
      )}
    </div>
  );
};

export default App;
