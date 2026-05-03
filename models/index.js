const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');

// Set up associations
User.associate({ Project, Task });
Project.associate({ User });
Task.associate({ Project, User });

module.exports = { User, Project, Task };