'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn(
          'games',
          'game_name',
          {
              type: Sequelize.STRING,
              allowNull: false,
              defaultValue: 'test'
          }
      )
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('games', 'game_name')
  }
};
