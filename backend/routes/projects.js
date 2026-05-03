const express = require('express');
const Joi = require('joi');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Validation
const projectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  members: Joi.array().items(Joi.string())
});

// Get all projects (for members, only their projects)
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('createdBy members', 'name email');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('createdBy members', 'name email');
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (Admin only)
router.post('/', auth, roleCheck(['Admin']), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, description, members } = req.body;

  console.log('Creating project for user:', req.user.id, 'with data:', { name, description, members });

  try {
    const project = new Project({
      name,
      description,
      createdBy: req.user.id,
      members: [...members, req.user.id] // Include creator
    });
    await project.save();
    console.log('Project saved with ID:', project._id);
    await project.populate('createdBy members', 'name email');
    console.log('Project populated successfully');
    res.json(project);
  } catch (err) {
    console.log('Error creating project:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project (Admin only)
router.put('/:id', auth, roleCheck(['Admin']), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('createdBy members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project (Admin only)
router.delete('/:id', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;