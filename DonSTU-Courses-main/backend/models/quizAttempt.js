import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timeSpent: {
    type: DataTypes.INTEGER, // в секундах
    allowNull: false
  },
  answers: {
    type: DataTypes.JSONB, // Ответы пользователя
    allowNull: false
  },
  isPassed: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  attemptNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quiz_attempts',
  indexes: [
    {
      fields: ['userId', 'quizId']
    }
  ]
});

export default QuizAttempt;