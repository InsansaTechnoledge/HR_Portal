import React, {useState} from 'react';

function UploadFile(props) {

    const [fileName, setFileName] = useState('');

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
          setFileName(file.name);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name)
        }
        props.setFormData(prev => ({
            ...prev,
            name: file.name,
            document: file
        }));
    };

    return (
        <div>
            <div className="flex items-center justify-center w-full">
                <label
                    htmlFor="resume"
                    className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        {fileName ? (
                            <p className="ml-3 text-sm text-gray-500">
                                Selected file: <span className="font-medium">{fileName}</span>
                            </p>
                        ) : (
                            <p className="ml-3 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        )}
                    </div>
                    <input id="resume" type="file" className="hidden" onChange={handleFileChange} />
                </label>
            </div>
        </div>
    )
}

export default UploadFile;