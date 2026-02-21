import { Course, Enrollment, Lesson, User, Profile, QuizAttempt, Quiz, Question } from "../models/index.js"
import { checkAndAwardAchievements } from './achievementController.js'; 
import { Op } from 'sequelize';
export const getUserCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            {
              model: Lesson,
              as: 'lessons',
              attributes: ['id']
            }
          ]
        }
      ]
    });

    if (!enrollments.length) {
      return res.json({
        success: false,
        message: "У вас пока нет курсов"
      });
    }

    const userCourses = enrollments.map(enrollment => ({
      ...enrollment.course.toJSON(),
      enrollmentStatus: enrollment.status,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt
    }));

    res.json({
      success: true,
      courses: userCourses,
    });
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении курсов пользователя'
    });
  }
}

export const getAvailableCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const userEnrollments = userId ? await Enrollment.findAll({
      where: { userId },
      attributes: ['courseId']
    }) : [];

    const enrolledCourseIds = userEnrollments.map(enrollment => enrollment.courseId);

    const whereCondition = enrolledCourseIds.length > 0 
      ? { id: { [Op.notIn]: enrolledCourseIds } }
      : {};

    const availableCourses = await Course.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'email'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['firstName', 'lastName', 'avatar']
            }
          ]
        },
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['id']
        }
      ]
    });

    res.json({
      success: true,
      courses: availableCourses,
    });
  } catch (error) {
    console.error('Get available courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении доступных курсов'
    });
  }
}

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'email'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['firstName', 'lastName', 'avatar']
            }
          ]
        },
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['id']
        }
      ]
    });

    console.log(courses);

    if (!courses) {
      return res.json({
        success: false,
        message: "Курсы не найдены"
      });
    }

    res.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Get courses error'
    });
  }
}

export const getTopicDetails = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const userId = req.user.id;

    const lesson = await Lesson.findOne({
      where: { 
        id: topicId,
        courseId: courseId
      },
      attributes: { 
        exclude: ['content']
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
          include: [
            {
              model: Lesson,
              as: 'lessons',
              attributes: ['id', 'title', 'order'],
              order: [['order', 'ASC']]
            }
          ]
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Урок не найден"
      });
    }

    const enrollment = await Enrollment.findOne({
      where: { 
        userId: userId, 
        courseId: courseId 
      },
      attributes: ['progress', 'status', 'currentLessonId']
    });

    let isCompleted = false;
    if (enrollment && enrollment.currentLessonId) {
      const currentLessonOrder = lesson.order;
      const currentUserLesson = await Lesson.findByPk(enrollment.currentLessonId);
      isCompleted = currentUserLesson && currentUserLesson.order > currentLessonOrder;
    }

    res.json({
      success: true,
      topic: {
        ...lesson.toJSON(),
        isCompleted,
        userProgress: enrollment ? enrollment.progress : 0
      }
    });
  } catch (error) {
    console.error('Get topic details error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении информации об уроке'
    });
  }
}

export const getTopicContent = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;

    const lesson = await Lesson.findOne({
      where: { 
        id: topicId,
        courseId: courseId
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Урок не найден"
      });
    }

    res.json({
      success: true,
      topic: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        duration: lesson.duration,
        courseTitle: lesson.course.title,
        resources: lesson.resources || []
      }
    });
  } catch (error) {
    console.error('Get topic content error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении контента урока'
    });
  }
}

export const getQuizData = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findOne({
      where: { 
        lessonId: topicId,
        courseId: courseId
      },
      include: [
        {
          model: Question,
          as: 'questions',
          order: [['order', 'ASC']],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Квиз не найден"
      });
    }

    const previousAttempts = await QuizAttempt.findAll({
      where: {
        userId: userId,
        quizId: quiz.id
      },
      order: [['attemptNumber', 'DESC']],
      limit: 1
    });

    const lastAttempt = previousAttempts[0] || null;
    const nextAttemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    res.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        questionsCount: quiz.questionsCount,
        questions: quiz.questions,
        courseTitle: quiz.course.title,
        userStats: {
          totalAttempts: previousAttempts.length,
          lastScore: lastAttempt ? lastAttempt.score : 0,
          nextAttemptNumber: nextAttemptNumber,
          attemptsLeft: quiz.maxAttempts - previousAttempts.length
        }
      }
    });
  } catch (error) {
    console.error('Get quiz data error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении данных квиза'
    });
  }
}

export const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const userId = req.user.id;
    const { progress, completed } = req.body;

    const enrollment = await Enrollment.findOne({
      where: { 
        userId: userId, 
        courseId: courseId 
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Запись о курсе не найдена"
      });
    }

    if (completed) {
      const currentLesson = await Lesson.findByPk(topicId);
      if (currentLesson) {
        const nextLesson = await Lesson.findOne({
          where: {
            courseId: courseId,
            order: currentLesson.order + 1
          },
          order: [['order', 'ASC']]
        });

        enrollment.currentLessonId = nextLesson ? nextLesson.id : topicId;
        
        const totalLessons = await Lesson.count({ where: { courseId } });
        const completedLessons = nextLesson ? nextLesson.order - 1 : totalLessons;
        enrollment.progress = Math.round((completedLessons / totalLessons) * 100);

        if (!nextLesson) {
          enrollment.status = 'completed';
          enrollment.completedAt = new Date();
        }
      }
    }

    await enrollment.save();

    res.json({
      success: true,
      message: "Прогресс обновлен",
      enrollment: {
        progress: enrollment.progress,
        currentLessonId: enrollment.currentLessonId,
        status: enrollment.status
      }
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении прогресса'
    });
  }
}


const getNextAttemptNumber = async (userId, quizId) => {
  const lastAttempt = await QuizAttempt.findOne({
    where: { userId, quizId },
    order: [['attemptNumber', 'DESC']]
  });
  
  return lastAttempt ? lastAttempt.attemptNumber + 1 : 1;
};

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТИСТИКИ ПРОФИЛЯ
const updateUserProfileStats = async (userId, score) => {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    
    if (profile) {
      // Получаем общее количество попыток квизов пользователя
      const totalQuizAttempts = await QuizAttempt.count({ where: { userId } });
      
      // Рассчитываем новый средний балл
      let newAverageScore = score; // По умолчанию используем текущий балл
      
      if (totalQuizAttempts > 1) {
        // Если есть предыдущие попытки, рассчитываем среднее
        const totalScoreSum = await QuizAttempt.sum('score', { where: { userId } });
        newAverageScore = totalScoreSum / totalQuizAttempts;
      }
      
      // Получаем количество завершенных тем (успешно пройденных квизов)
      const completedTopics = await QuizAttempt.count({
        where: { 
          userId,
          isPassed: true 
        }
      });
      
      await Profile.update(
        {
          averageScore: newAverageScore.toFixed(2),
          completedTopics: completedTopics
        },
        { where: { userId } }
      );

      // Обновляем количество активных курсов
      const activeCourses = await Enrollment.count({
        where: { 
          userId, 
          status: 'active'
        }
      });

      await Profile.update(
        { activeCourses },
        { where: { userId } }
      );
      
      console.log(`✅ Статистика профиля обновлена для пользователя ${userId}:`, {
        averageScore: newAverageScore.toFixed(2),
        completedTopics,
        activeCourses
      });
    }
  } catch (error) {
    console.error('Update profile stats error:', error);
  }
};

const getCompletedLessonsCount = async (userId, courseId) => {
  try {
    const passedQuizAttempts = await QuizAttempt.findAll({
      where: {
        userId,
        isPassed: true
      },
      include: [{
        model: Quiz,
        as: 'quiz',
        where: { courseId },
        attributes: ['lessonId'],
        required: true
      }]
    });
    
    // Убедимся, что учитываем только уникальные lessonId
    const completedLessonIds = [...new Set(passedQuizAttempts
      .map(attempt => attempt.quiz.lessonId)
      .filter(lessonId => lessonId !== null) // Исключаем null значения
    )];
    
    return completedLessonIds.length;
  } catch (error) {
    console.error('Error getting completed lessons count:', error);
    return 0;
  }
};




export const getCourseWithTopics = async (req, res) => {
  try {
    const {courseId} = req.params;
    const userId = req.user?.id;

    const course = await Course.findOne({
      where: { id: courseId },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'email'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['firstName', 'lastName', 'avatar', 'bio']
            }
          ]
        },
        {
          model: Lesson,
          as: 'lessons',
          attributes: { 
            exclude: ['content', 'videoUrl']
          },
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Курс не найден"
      });
    }

    let userProgress = [];
    let completedTopics = new Set();
    let currentLessonId = null;

    if (userId) {
      // Получаем enrollment пользователя
      const enrollment = await Enrollment.findOne({
        where: { 
          userId: userId, 
          courseId 
        },
        attributes: ['progress', 'status', 'currentLessonId', 'enrolledAt']
      });
      
      if (enrollment) {
        userProgress = [enrollment];
        currentLessonId = enrollment.currentLessonId;

        // ПРОСТАЯ ЛОГИКА: получаем ТОЛЬКО пройденные квизы
        const passedQuizAttempts = await QuizAttempt.findAll({
          where: {
            userId: userId,
            isPassed: true
          },
          include: [{
            model: Quiz,
            as: 'quiz',
            where: { courseId },
            attributes: ['lessonId'],
            required: true
          }]
        });

        // Добавляем ТОЛЬКО lessonId пройденных квизов
        passedQuizAttempts.forEach(attempt => {
          if (attempt.quiz.lessonId) {
            completedTopics.add(attempt.quiz.lessonId);
          }
        });

        console.log('✅ Completed topics from DB:', Array.from(completedTopics));
      }
    }

    res.json({
      success: true,
      course: {
        ...course.toJSON(),
        userProgress,
        completedTopics: Array.from(completedTopics)
      }
    });
  } catch (error) {
    console.error('Get course with topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении информации о курсе'
    });
  }
}

export const completeQuiz = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const userId = req.user.id;
    const { score, correctAnswers, totalQuestions, timeSpent, answers, quizId } = req.body;

    // Создаем запись о попытке
    const quizAttempt = await QuizAttempt.create({
      userId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      answers,
      isPassed: score >= 70,
      attemptNumber: await getNextAttemptNumber(userId, quizId)
    });

    // Находим текущий урок
    const currentLesson = await Lesson.findOne({
      where: { 
        id: topicId,
        courseId: courseId
      }
    });

    if (!currentLesson) {
      return res.status(404).json({
        success: false,
        message: "Урок не найден"
      });
    }

    // Находим или создаем enrollment
    let enrollment = await Enrollment.findOne({
      where: { 
        userId: userId, 
        courseId: courseId 
      }
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId,
        courseId,
        currentLessonId: topicId,
        progress: 0,
        status: 'active'
      });
    }

    let awardedAchievements = [];
    let nextLessonAvailable = false;

    if (score >= 70) { // Только если квиз пройден успешно
      // ОТМЕЧАЕМ ТЕКУЩИЙ УРОК КАК ПРОЙДЕННЫЙ (добавляем в completedTopics)
      // и открываем следующий урок как текущий
      
      const nextLesson = await Lesson.findOne({
        where: {
          courseId: courseId,
          order: currentLesson.order + 1
        },
        order: [['order', 'ASC']]
      });

      // Обновляем текущий урок на следующий ТОЛЬКО если он существует
      if (nextLesson) {
        enrollment.currentLessonId = nextLesson.id;
        nextLessonAvailable = true;
      } else {
        // Если следующего урока нет, оставляем текущий урок
        enrollment.currentLessonId = currentLesson.id;
      }

      // Пересчитываем прогресс на основе ПРОЙДЕННЫХ КВИЗОВ
      const totalLessons = await Lesson.count({ where: { courseId } });
      const completedLessons = await getCompletedLessonsCount(userId, courseId);
      const progress = Math.round((completedLessons / totalLessons) * 100);
      enrollment.progress = progress;

      await enrollment.save();

      // Обновляем статистику профиля
      await updateUserProfileStats(userId, score);

      // Проверяем достижения
      const lessonAchievements = await checkAndAwardAchievements(userId, 'lesson_completed', {
        score,
        courseId,
        topicId,
        quizId,
        lessonId: topicId
      });
      awardedAchievements = [...awardedAchievements, ...lessonAchievements];

      const quizAchievements = await checkAndAwardAchievements(userId, 'quiz_completed', {
        score,
        courseId,
        topicId,
        quizId
      });
      awardedAchievements = [...awardedAchievements, ...quizAchievements];

      // Если курс завершен
      if (progress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        await enrollment.save();
        
        const courseCompletionAchievements = await checkAndAwardAchievements(userId, 'course_completed', {
          courseId,
          enrollmentId: enrollment.id
        });
        awardedAchievements = [...awardedAchievements, ...courseCompletionAchievements];
      }
    }

    res.json({
      success: true,
      message: "Квиз успешно завершен",
      quizAttempt: {
        score,
        correctAnswers,
        totalQuestions,
        isPassed: quizAttempt.isPassed
      },
      nextLessonAvailable: nextLessonAvailable,
      awardedAchievements: awardedAchievements.map(a => a.name),
      enrollment: {
        progress: enrollment.progress,
        currentLessonId: enrollment.currentLessonId,
        status: enrollment.status
      }
    });

  } catch (error) {
    console.error('Complete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при завершении квиза'
    });
  }
};