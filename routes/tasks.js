const express = require('express');
const Joi = require('joi');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Validation
const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  project: Joi.string().required(),
  assignedTo: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('Pending', 'In Progress', 'Completed').optional(),
  dueDate: Joi.date().allow('', null).optional()
});

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is member or admin
    const isMember = project.members.some((member) => member.toString() === req.user.id);
    if (req.user.role !== 'Admin' && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, roleCheck(['Admin']), async (req, res) => {
  const { error } = taskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const data = { ...req.body };
    if (!data.assignedTo) delete data.assignedTo;
    if (!data.dueDate) delete data.dueDate;
    if (!data.description) delete data.description;

    const task = new Task(data);
    await task.save();
    await task.populate('assignedTo', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task (Admin or assigned member)
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Admin can update anything, member can only update status if assigned
    let updateData = req.body;
    if (req.user.role !== 'Admin') {
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Members can only update status
      if (!req.body.status || !['Pending', 'In Progress', 'Completed'].includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updateData = { status: req.body.status };
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('assignedTo', 'name email');
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task (Admin only)
router.delete('/:id', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    let matchCondition = {};
    if (req.user.role !== 'Admin') {
      const projects = await Project.find({ members: req.user.id });
      const projectIds = projects.map(p => p._id);
      matchCondition = { project: { $in: projectIds } };
    }

    const stats = await Task.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$status', 'Completed'] }, { $lt: ['$dueDate', new Date()] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json(stats[0] || { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;