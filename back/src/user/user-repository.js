'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const UserRepository = {
    TOKENS: {},

    init: (args) => {
      this.db = args.db;
    },

    findUserByEmailAndPassword: (email, password) =>
        this.db.query(`
            SELECT *
            FROM User 
            WHERE email = '${email}' AND password = '${password}'
    `).then((users) => users[0]),

    findUserByEmail: (email) =>
        this.db.query(`
            SELECT *
            FROM User 
            WHERE email = '${email}'
    `).then((users) => users[0]),

    findUserByEmailAndToken: (email, token) => {
        const user = UserRepository.TOKENS[token];
        if (user) {
            return UserRepository.findUserById(user.id);
        } else {
            return Promise.reject('No user found');
        }
    },

    findUserById: (id) =>
        this.db.query(`
            SELECT user.* 
            FROM User user 
            WHERE user.id = ${id}
    `).then((users) => users[0]),

    findUsersBySkill: (id) =>
        this.db.query(`
            SELECT user.* 
            FROM UserSkill user_skill 
            JOIN User user ON user.id = user_skill.user_id 
            WHERE skill_id = ${id}
    `),

    findUserRolesById: (id) =>
        this.db.query(`
            SELECT name
            FROM UserRole user_role
            JOIN Role role ON role.id = user_role.roles_id
            WHERE user_id = ${id}
        `),

    getUsers: () =>
        this.db.query(`
            SELECT * 
            FROM User
            ORDER BY name
    `),

    getUsersWithRoles: (roles) =>
        this.db.query(`
            SELECT *
            FROM User
            WHERE id IN (SELECT DISTINCT(user_id)
                                FROM UserRole ur
                                JOIN Role r ON r.id = ur.roles_id
                                WHERE r.name IN ('${roles}')
                        )
        `),

    addNewUser: (user) =>
        this.db.query(`
            INSERT INTO User (name, email, password)
            VALUES ('${user.name}','${user.email}', '${user.password}')
    `),

    deleteUserById: (id) =>
        this.db.query(`DELETE FROM UserRole WHERE User_id = ${id}`).then(() =>
            this.db.query(`DELETE FROM UserSkill WHERE user_id = ${id}`)).then(() =>
            this.db.query(`DELETE FROM User WHERE id = ${id}`)),

    updateUser: (id, user) =>
        this.db.query(`
            UPDATE User
            SET diploma = '${user.diploma}'
            WHERE id = ${id}`),

    assignManager: (userId, managerId) =>
        this.db.query(`
            UPDATE User SET manager_id = ${managerId} WHERE id = ${userId}
        `),

    addRole: (user, roleName) =>
        this.db.query(`SELECT DISTINCT id FROM Role WHERE name = '${roleName}'`)
            .then((roles) => this.db.query(`INSERT INTO UserRole(User_id,roles_id) VALUES (${user.id}, ${roles[0].id})`)),

    getUpdates: () =>
        this.db.query(`
            SELECT domain.id domain_id, domain.name domain_name, user.diploma user_diploma, user.email user_email, user.id user_id, user.name user_name, skill.id skill_id, user_skill.interested skill_interested, user_skill.level skill_level, skill.name skill_name, user_skill.updatedAt skill_date, user_skill.id user_skill_id
            FROM UserSkill user_skill
                JOIN User user ON user_skill.user_id = user.id
                JOIN Skill skill ON skill.id = user_skill.skill_id
                LEFT JOIN Domain domain ON domain.id = skill.domain_id
            ORDER BY user_skill.updatedAt DESC
    `)
};

module.exports = UserRepository;