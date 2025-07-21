import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

const KnowledgeBaseUploader = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select files to upload.');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const { data } = await api.post('/embed/batch-upload', formData);
      const successCount = data.results.filter(r => r.status === 'success').length;
      const errorCount = data.results.filter(r => r.status === 'error').length;
      setUploadStatus(`Upload complete! ${successCount} successful, ${errorCount} failed.`);
      setFiles([]); // Clear files after upload
    } catch (error) {
      setUploadStatus('Upload failed. Check the server connection and file formats.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  return (
    <div className="uploader-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Drop the files here ...' : 'Drag & drop documents here, or click to select'}</p>
        <em style={{fontSize: '12px', color: '#666'}}>(.pdf, .docx, .txt)</em>
      </div>
      <aside className="file-list">
        <h4>Selected Files:</h4>
        <ul>
          {files.map(file => (
            <li key={file.path}>
              {file.path} - {(file.size / 1024).toFixed(2)} KB
              <button onClick={() => removeFile(file.name)} className="remove-file-btn">
                &times;
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <button onClick={handleUpload} disabled={isLoading || files.length === 0} className="upload-btn">
        {isLoading ? 'Processing...' : `Upload ${files.length} File(s)`}
      </button>
      {uploadStatus && <p className="status-message">{uploadStatus}</p>}
    </div>
  );
};

export default KnowledgeBaseUploader;