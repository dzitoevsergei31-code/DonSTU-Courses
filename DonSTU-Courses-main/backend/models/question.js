import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('single', 'multiple', 'text'),
    defaultValue: 'single'
  },
  options: {
    type: DataTypes.JSONB, // Варианты ответов
    allowNull: false
  },
  correctAnswers: {
    type: DataTypes.JSONB, // Правильные ответы
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'questions'
});

export default Question;