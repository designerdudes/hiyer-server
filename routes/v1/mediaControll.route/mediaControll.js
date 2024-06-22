import express from 'express'; 
import { upload } from '../../../config/multer.js';
import { deleteMediaForIndividualUsers, uploadMediaForIndividualUsers } from '../../../controllers/mediaControl.controller/mediaUpload.js';


const router = express.Router();
// Define the upload route
// router.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
//   try {
    // console.log('Uploaded files:', req.files);
    // console.log('Timestamps:', req.body.timestamps);
    // console.log('Continue Without Timestamps:', req.body.continueWithoutTimestamps);
 
//     res.status(200).json({ success: true, message: 'Files uploaded successfully' });
//   } catch (error) {
//     console.error('Error uploading files:', error);
//     res.status(500).json({ success: false, message: 'Failed to upload files', error: error.message });
//   }
// });


router.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]),  uploadMediaForIndividualUsers);

router.delete('/videoResume/:videoId', deleteMediaForIndividualUsers);
export default router;
