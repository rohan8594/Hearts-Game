'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable(
          'game_players',
          {
              user_id: {
                  type: Sequelize.INTEGER,
                  allowNull: false,
                  references: {
                      model: 'users',
                      key: 'user_id'
                  }
              },
              game_id: {
                  type: Sequelize.INTEGER,
                  allowNull: false,
                  references: {
                      model: 'games',
                      key: 'game_id'
                  }
              },
              total_score: {
                  type: Sequelize.INTEGER,
                  allowNull: true,
                  defaultValue: null
              },
              current_round_score: {
                  type: Sequelize.INTEGER,
                  allowNull: true,
                  defaultValue: null
              },
              turn_sequence: {
                  type: Sequelize.INTEGER,
                  allowNull: false
              }
          }
      );
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('game_players');
  }
};
