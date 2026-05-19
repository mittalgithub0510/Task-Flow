import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

export const createCertificate = async (req, res) => {
  try {
    const { memberId, projectName, completedTasks, performanceScore } = req.body;
    const user = await User.findById(memberId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const certificateId = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const certificate = await Certificate.create({
      memberName: user.name,
      projectName,
      completedTasks,
      performanceScore,
      issuedBy: req.user._id,
      certificateId
    });
    
    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({}).populate('issuedBy', 'name');
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const certificates = await Certificate.find({ memberName: user.name });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ message: 'Not found' });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
