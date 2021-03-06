const bcrypt = require('bcrypt');

const password = 'password';

module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert('Users', [{
      userName: 'Admin',
      email: 'admin@localhost',
      password: bcrypt.hashSync(password, 10),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {}),

  down: queryInterface =>
    queryInterface.bulkDelete('Users', null, {})
};
