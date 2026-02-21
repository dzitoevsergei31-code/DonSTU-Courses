import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timeLimit: {
    type: DataTypes.INTEGER, // в минутах
    allowNull: true
  },
  passingScore: {
    type: DataTypes.INTEGER, // минимальный балл для прохождения
    defaultValue: 70
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  questionsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'quizzes'
});

export default Quiz;