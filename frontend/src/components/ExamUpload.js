import React, { useState } from "react";

const ExamUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      alert("File uploaded successfully!");
      // You can add API logic here to send the file to the backend
    }
  };

  return (
    <div>
      <h2>Upload an Exam</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,application/pdf"
        />
        <button type="submit">Upload Exam</button>
      </form>
    </div>
  );
};

export default ExamUpload;
