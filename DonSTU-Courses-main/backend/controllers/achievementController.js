// achievementController.js
import { Achievement, UserAchievement } from '../models/index.js';

// achievementController.js - обновленная функция checkAchievementCriteria
const checkAchievementCriteria = async (userId, achievement, action, metadata) => {
  const criteria = achievement.criteria || {};
  
  switch (achievement.type) {
    case 'course_completion':
      if (action === 'course_completed') {
        const userCoursesCount = await getCompletedCoursesCount(userId);
        return userCoursesCount >= (criteria.targetCount || 1);
      }
      break;
      
    case 'perfect_score':
      if (action === 'quiz_completed') {
        const minScore = criteria.minScore || 100;
        if (metadata.score >= minScore) {
          const perfectQuizzesCount = await getPerfectQuizzesCount(userId);
          return perfectQuizzesCount >= (criteria.targetCount || 1);
        }
      }
      break;
      
    case 'streak':
      if (action === 'lesson_completed') {
        const currentStreak = await getCurrentStreak(userId);
        return currentStreak >= (criteria.targetDays || 7);
      }
      break;
      
    case 'lesson_completion':
      if (action === 'lesson_completed') {
        const completedLessonsCount = await getCompletedLessonsCount(userId, metadata.courseId);
        
        // ДОБАВЛЯЕМ ПРОВЕРКУ ДЛЯ ПЕРВОЙ ТЕМЫ
        if (criteria.firstLesson && metadata.lessonOrder === 1) {
          return true;
        }
        
        return completedLessonsCount >= (criteria.lessonsCompleted || 1);
      }
      break;
      
    default:
      return false;
  }
  
  return false;
};

// Обновленная функция getAchievementTypeByAction
const getAchievementTypeByAction = (action) => {
  const actionToTypeMap = {
    'course_started': 'course_completion',
    'course_completed': 'course_completion',
    'quiz_completed': 'perfect_score',
    'lesson_completed': 'lesson_completion',
  };
  
  return actionToTypeMap[action] || 'other';
};

const getCompletedLessonsCount = async (userId, courseId) => {
  try {
    const completedAttempts = await QuizAttempt.findAll({
      where: {
        userId,
        isPassed: true
      },
      include: [{
        model: Quiz,
        as: 'quiz',
        where: { courseId },
        attributes: ['lessonId']
      }]
    });
    
    const completedLessonIds = [...new Set(completedAttempts.map(attempt => attempt.quiz.lessonId))];
    return completedLessonIds.length;
  } catch (error) {
    console.error('Error getting completed lessons count:', error);
    return 0;
  }
};

export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [
        {
          model: Achievement,
          as: 'achievement',
          attributes: ['id', 'name', 'description', 'icon', 'type', 'rarity', 'xpReward', 'criteria']
        }
      ],
      order: [['earnedAt', 'DESC']]
    });

    const allAchievements = await Achievement.findAll({
      order: [['rarity', 'DESC'], ['xpReward', 'DESC']]
    });

    const achievementsWithProgress = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievement.id === achievement.id
      );

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        type: achievement.type,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward,
        criteria: achievement.criteria,
        earned: !!userAchievement,
        earnedAt: userAchievement?.earnedAt || null,
        progress: userAchievement?.progress || 0,
        progressPercentage: calculateProgressPercentage(achievement, userAchievement)
      };
    });

    const stats = {
      total: allAchievements.length,
      earned: userAchievements.length,
      progress: allAchievements.length > 0 ? Math.round((userAchievements.length / allAchievements.length) * 100) : 0,
      totalXP: userAchievements.reduce((sum, ua) => sum + ua.achievement.xpReward, 0),
      byRarity: {
        common: achievementsWithProgress.filter(a => a.rarity === 'common' && a.earned).length,
        rare: achievementsWithProgress.filter(a => a.rarity === 'rare' && a.earned).length,
        epic: achievementsWithProgress.filter(a => a.rarity === 'epic' && a.earned).length,
        legendary: achievementsWithProgress.filter(a => a.rarity === 'legendary' && a.earned).length
      }
    };

    res.json({
      success: true,
      achievements: achievementsWithProgress,
      stats
    });

  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении достижений'
    });
  }
};

export const getAchievementProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementId } = req.params;

    const userAchievement = await UserAchievement.findOne({
      where: { userId, achievementId },
      include: [
        {
          model: Achievement,
          as: 'achievement'
        }
      ]
    });

    if (!userAchievement) {
      return res.json({
        success: true,
        earned: false,
        progress: 0
      });
    }

    res.json({
      success: true,
      earned: true,
      progress: userAchievement.progress,
      earnedAt: userAchievement.earnedAt,
      achievement: userAchievement.achievement
    });

  } catch (error) {
    console.error('Get achievement progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении прогресса достижения'
    });
  }
};

const calculateProgressPercentage = (achievement, userAchievement) => {
  if (!userAchievement) return 0;
  
  const criteria = achievement.criteria || {};
  
  if (criteria.targetValue && criteria.currentValue) {
    return Math.min(Math.round((criteria.currentValue / criteria.targetValue) * 100), 100);
  }
  
  return userAchievement.earned ? 100 : 0;
};

export const checkAndAwardAchievements = async (userId, action, metadata = {}) => {
  try {
    const achievementsToCheck = await Achievement.findAll({
      where: {
        type: getAchievementTypeByAction(action)
      }
    });

    const awardedAchievements = [];

    for (const achievement of achievementsToCheck) {
      const shouldAward = await checkAchievementCriteria(userId, achievement, action, metadata);
      
      if (shouldAward) {
        const [userAchievement, created] = await UserAchievement.findOrCreate({
          where: { userId, achievementId: achievement.id },
          defaults: {
            progress: 100,
            earnedAt: new Date()
          }
        });

        if (created) {
          awardedAchievements.push(achievement);
          
          // Создаем уведомление о получении достижения
          await createAchievementNotification(userId, achievement);
        }
      }
    }

    return awardedAchievements;

  } catch (error) {
    console.error('Check and award achievements error:', error);
    return [];
  }
};

const getCompletedCoursesCount = async (userId) => {
  try {
    const completedCourses = await Enrollment.count({
      where: { 
        userId, 
        status: 'completed' 
      }
    });
    return completedCourses;
  } catch (error) {
    console.error('Error getting completed courses count:', error);
    return 0;
  }
};

const getPerfectQuizzesCount = async (userId) => {
  try {
    const perfectAttempts = await QuizAttempt.count({
      where: { 
        userId, 
        score: 100 
      }
    });
    return perfectAttempts;
  } catch (error) {
    console.error('Error getting perfect quizzes count:', error);
    return 0;
  }
};

const getCurrentStreak = async (userId) => {
  try {
    // Простая реализация - считаем уникальные дни с активностью за последние 7 дней
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await QuizAttempt.findAll({
      where: { 
        userId,
        completedAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: ['completedAt'],
      order: [['completedAt', 'DESC']]
    });
    
    // Логика подсчета серии дней...
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < recentActivities.length; i++) {
      const activityDate = new Date(recentActivities[i].completedAt);
      activityDate.setHours(0, 0, 0, 0);
      
      const diffTime = today - activityDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error getting current streak:', error);
    return 0;
  }
};

// Функция создания уведомления
const createAchievementNotification = async (userId, achievement) => {
  try {
    await Notification.create({
      userId,
      type: 'achievement',
      title: '🎉 Новое достижение!',
      message: `Вы получили достижение "${achievement.name}" - ${achievement.description}`,
      actionUrl: '/achievements',
      priority: 'high'
    });
  } catch (error) {
    console.error('Create achievement notification error:', error);
  }
};