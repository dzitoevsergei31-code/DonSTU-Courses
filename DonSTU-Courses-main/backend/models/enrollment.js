import sequelize from '../config/db.js'
import { DataTypes } from 'sequelize';

const Enrollment = sequelize.define('Enrollment', {
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
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  currentLessonId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  totalScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped'),
    defaultValue: 'active'
  }
}, {
  tableName: 'enrollments',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'courseId']
    },
    {
      fields: ['status']
    }
  ]
});

export default Enrollment;