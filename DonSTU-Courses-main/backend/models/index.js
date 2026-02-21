import sequelize from '../config/db.js';
import User from './user.js';
import Profile from './profile.js';
import Course from './course.js';
import Lesson from './lesson.js';
import Quiz from './quiz.js'
import Question from './question.js'
import QuizAttempt from './quizAttempt.js'
import Achievement from './achievement.js'
import UserAchievement from './userAchievement.js'
import Activity from './activity.js'
import Notification from './notification.js'
import Enrollment from './enrollment.js'

// Определение связей
const defineAssociations = () => {
  // User - Profile (One-to-One)
  User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
  Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - Courses (Many-to-Many через Enrollment)
  User.belongsToMany(Course, { 
    through: Enrollment, 
    foreignKey: 'userId',
    as: 'courses'
  });
  Course.belongsToMany(User, { 
    through: Enrollment, 
    foreignKey: 'courseId',
    as: 'students'
  });

  // Course - Lessons (One-to-Many)
  Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
  Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

  // Course - Quizzes (One-to-Many)
  Course.hasMany(Quiz, { foreignKey: 'courseId', as: 'quizzes' });
  Quiz.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

  // Lesson - Quiz (One-to-One)
  Lesson.hasOne(Quiz, { foreignKey: 'lessonId', as: 'quiz' });
  Quiz.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

  // Quiz - Questions (One-to-Many)
  Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions' });
  Question.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

  // User - QuizAttempts (One-to-Many)
  User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
  QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Quiz - QuizAttempts (One-to-Many)
  Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
  QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

  // User - Achievements (Many-to-Many)
  User.belongsToMany(Achievement, {
    through: UserAchievement,
    foreignKey: 'userId',
    as: 'achievements'
  });
  Achievement.belongsToMany(User, {
    through: UserAchievement,
    foreignKey: 'achievementId',
    as: 'users'
  });

  // User - Activities (One-to-Many)
  User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
  Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - Notifications (One-to-Many)
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Course - Achievements (One-to-Many)
  Course.hasMany(Achievement, { foreignKey: 'courseId', as: 'achievements' });
  Achievement.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

  // User - Enrollment (One-to-Many)
User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course - Enrollment (One-to-Many)
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course - User (Instructor) (Many-to-One)
Course.belongsTo(User, { 
  foreignKey: 'instructorId', 
  as: 'instructor' 
});
User.hasMany(Course, { 
  foreignKey: 'instructorId', 
  as: 'instructedCourses' 
});

// Enrollment - Lesson (Current Lesson) (Many-to-One)
Enrollment.belongsTo(Lesson, { 
  foreignKey: 'currentLessonId', 
  as: 'currentLesson' 
});
Lesson.hasMany(Enrollment, { 
  foreignKey: 'currentLessonId', 
  as: 'enrollments' 
});
};

// UserAchievement - Achievement (Many-to-One)
UserAchievement.belongsTo(Achievement, {
  foreignKey: 'achievementId',
  as: 'achievement'
});

Achievement.hasMany(UserAchievement, {
  foreignKey: 'achievementId',
  as: 'userAchievements'
});

// UserAchievement - User (Many-to-One)
UserAchievement.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(UserAchievement, {
  foreignKey: 'userId',
  as: 'userAchievements'
});

defineAssociations();

export { 
  sequelize, 
  User, 
  Profile, 
  Course,
  Lesson,
  Quiz,
  Question,
  QuizAttempt,
  Achievement,
  UserAchievement,
  Activity,
  Notification,
  Enrollment 
}
