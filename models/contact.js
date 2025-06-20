'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
    }
  }

  Contact.init(
    {
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkedId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      linkPrecedence: {
        type: DataTypes.ENUM('primary', 'secondary'),
        allowNull: false,
        defaultValue: 'primary',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Contact',
      tableName: 'contacts',
      timestamps: true,
      paranoid: true, 
    }
  );

  return Contact;
};