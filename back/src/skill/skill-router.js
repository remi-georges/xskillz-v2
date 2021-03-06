'use strict';

const SkillController = require('./skill-controller');
const Security = require('../security');
const ROLES = require('../security').ROLES;

const SkillRouter = {
    register: (express) => {
        express
        .get('/skills/export', Security.require([ROLES.manager]), SkillController.exportUserSkills)
        .get('/skills', SkillController.getSkills)
        .put('/skills', Security.requireLogin, SkillController.merge)
        .post('/me/skills', Security.requireLogin, SkillController.addSkill)
        .put('/skills/:id', Security.requireLogin, SkillController.updateSkill)
        .put('/me/skills/:id', Security.requireLogin, SkillController.updateUserSkillById)
        .delete('/me/skills/:id', Security.requireLogin, SkillController.deleteUserSkillById)
        .post('/domains/:id/skills', Security.requireLogin, SkillController.addSkillToDomain);
    }
};

module.exports = SkillRouter;
