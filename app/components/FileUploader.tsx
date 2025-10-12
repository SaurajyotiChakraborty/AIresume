import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/format";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {


    const onDrop = useCallback((acceptedFiles: File[]) => {
        const File = acceptedFiles[0] || null;


        onFileSelect?.(File);

    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 20 * 1024 * 1024,
    });

    const file = acceptedFiles[0] || null;


    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="space-y-4 cursor-pointer">

                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <p className="text-sm font-medium text-grey-700 truncate max-w-xs">
                                    Selected file: <span className="font-semibold">{file.name}</span>
                                </p>
                                <p className="text-sm text-grey-500">
                                    Size: {formatSize(file.size)}
                                </p>


                            </div>
                            <button
                                type="button"
                                className="p-2 cursor-pointer"
                                onClick={() => onFileSelect?.(null)}
                            >
                                <img
                                    src="/icons/cross.svg"
                                    alt="remove"
                                    className="w-4 h-4"
                                />
                            </button>


                        </div>

                    ) : (
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="Upload" className="size-200" />
                            </div>
                            <p className=" text-lg text-grey-500">
                                <span className='font-semibold'>
                                    Click to upload
                                </span> or drag and drop
                            </p>
                            <p className=" text-lg text-grey-500"> PDF (max {formatSize(20 * 1024 * 1024)})</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
