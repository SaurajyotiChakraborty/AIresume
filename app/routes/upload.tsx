import React, { type FormEvent, useState } from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from 'constances';

const Upload = () => {
    const { auth, isLoading, fs, ai , kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        
    }
    const handleAnalyze = async (
        { companyName, jobTitle, jobDescription, file }: {
          companyName: string;
          jobTitle: string;
          jobDescription: string;
          file: File;
        }
      ) => {
        setIsProcessing(true);
        setStatusText("Uploading the file...");
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image.... ')
        const imageFile=  await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText('Error: Failed to convert  pdf to image');

        setStatusText('uploading to puter.... ')
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('preparing the data.... ');

        const uuid = generateUUID();
        const data={
            id:uuid,
            resumePath : uploadedFile.path, 
            imagePath: uploadedImage.path,
            companyName,
            jobTitle,jobDescription,
            feedback: "",

        }
        await kv.set('resume:${uuid}', JSON.stringify(data))
        setStatusText("Analyzing...")
        const feedback = await ai.feedback(
            uploadedFile.path,

            prepareInstructions({jobTitle,jobDescription})
            

        )
        if(!feedback)return setStatusText('Error:Failed to analyze resume');
        const feedbackText = typeof  feedback.message.content==='string'
        ? feedback.message.content
        : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log(data);

        
        // setStatusText(feedback.message);
        // setIsProcessing(false);
        // function body
      };
      

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);
        const companyName = formData.get('Company-name') as string;
        const jobTitle = formData.get('Job-title') as string;
        const jobDescription = formData.get('Job-description') as string;
        const file = formData.get('Resume') as File;  // 👈 actually get the file
        
        if (!file) return; // exit if no file uploaded
        
        handleAnalyze({ companyName, jobTitle, jobDescription, file });


        

        // Your logic here
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1> Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src='/images/resume-scan.gif' className='w-full' />
                        </>
                    ) : (
                        <h2>Drop your resume for ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id='upload-form' onSubmit={handleSubmit} className="flex flex-col gap-4 mar">
                            <div className="form-div">
                                <label htmlFor="Company-name">Company Name</label>
                                <input type='text' name='Company-name' placeholder='Company Name' id='Company-name' />
                            </div>
                            <div className="form-div">
                                <label htmlFor="Job-title">Job Title</label>
                                <input type='text' name='Job-title' placeholder='Job Title' id='Job-title' />
                            </div>
                            <div className="form-div">
                                <label htmlFor="Job-description">Job Description</label>
                                <textarea
                                    rows={5}
                                    placeholder="Job Description"
                                    id="Job-description"
                                    name="Job-description"
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button className='primary-button' type="submit">Analyze Resume</button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
