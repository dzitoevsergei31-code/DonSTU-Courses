import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('Начинающий', 'Продвинутый', 'Уверенный'),
    defaultValue: 'Начинающий'
  },
  duration: {
    type: DataTypes.INTEGER, // в часах
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0
  },
}, {
  tableName: 'courses',
  indexes: [
    {
      fields: ['difficulty']
    },
    {
      fields: ['isPublished']
    }
  ]
});

export default Course;