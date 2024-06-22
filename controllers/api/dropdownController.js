import axios from 'axios'
import mongoose from "mongoose";

export const getInstitutes = async (req, res) => {
    const { substring } = req.params;
    const url = `${process.env.Dropdown}/institute/${substring}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching institutes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getDegrees = async (req, res) => {
    const { substring } = req.params;
    const url = `${process.env.Dropdown}/degree/${substring}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching degrees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getCompanies = async (req, res) => {
    const { substring } = req.params;
    const url = `${process.env.Dropdown}/company/${substring}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getSkills = async (req, res) => {
    const { substring } = req.params;
    const url = `${process.env.Dropdown}/skills/${substring}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

 
