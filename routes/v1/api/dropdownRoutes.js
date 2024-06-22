import express from 'express';

 import {getInstitutes,getDegrees,getCompanies,getSkills} from '../../../controllers/api/dropdownController.js'
const router = express.Router();

router.get('/institute/:substring', getInstitutes);
router.get('/degree/:substring', getDegrees);
router.get('/company/:substring', getCompanies);
router.get('/skills/:substring', getSkills);


export default router; 

