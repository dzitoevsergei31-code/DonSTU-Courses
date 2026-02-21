import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const Profile = sequelize.define('Profile', {
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
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  averageScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  activeCourses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completedTopics: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalStudyTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'profiles'
});

export default Profile;