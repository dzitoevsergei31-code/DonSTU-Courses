import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const UserAchievement = sequelize.define('UserAchievement', {
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
  achievementId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'achievements',
      key: 'id'
    }
  },
  earnedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'user_achievements',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'achievementId']
    }
  ]
});

export default UserAchievement;