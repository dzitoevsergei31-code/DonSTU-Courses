import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('course_completion', 'perfect_score', 'speed_run', 'streak', 'lesson_completion', 'other'),
    defaultValue: 'other'
  },
  criteria: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'achievements'
});

export default Achievement;