"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("cards", {
      card_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      card_value: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      card_suit: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("cards");
  }
};
