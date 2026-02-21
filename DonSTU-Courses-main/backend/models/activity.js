import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const Activity = sequelize.define('Activity', {
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
  type: {
    type: DataTypes.ENUM(
      'course_started',
      'course_completed',
      'lesson_completed',
      'quiz_completed',
      'achievement_earned',
      'profile_updated'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB, // Дополнительные данные
    defaultValue: {}
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activities',
  indexes: [
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['type']
    }
  ]
});

export default Activity;