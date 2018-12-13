'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable(
          'games',
          {
              game_id: {
                  type: Sequelize.INTEGER,
                  primaryKey: true,
                  autoIncrement: true
              },
              max_players: {
                  type: Sequelize.INTEGER,
                  allowNull: false,
              },
              current_player: {
                  type: Sequelize.INTEGER,
                  allowNull: true,
                  defaultValue: null,
                  references: {
                      model: 'users',
                      key: 'user_id'
                  }
              },
              game_name: {
                  type: Sequelize.STRING,
                  allowNull: false
              },
              round_number: {
                  type: Sequelize.INTEGER,
                  allowNull: true
              }
          }
      );
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('games');
  }
};
