import express from 'express';
import { completeQuiz, getAvailableCourses, getCourses, getCourseWithTopics, getQuizData, getTopicContent, getTopicDetails, getUserCourses, updateLessonProgress } from '../controllers/courseController.js';
import { routeProtection } from '../middleware/route-protection.js';

export const courseRoute = express.Router();

courseRoute.get('/get-courses', routeProtection, getCourses);
courseRoute.get('/my-courses', routeProtection, getUserCourses);
courseRoute.get('/available-courses', routeProtection, getAvailableCourses);
courseRoute.get('/:courseId', routeProtection, getCourseWithTopics);

courseRoute.get('/:courseId/topics/:topicId', routeProtection, getTopicDetails);
courseRoute.get('/:courseId/topics/:topicId/content', routeProtection, getTopicContent);
courseRoute.get('/:courseId/topics/:topicId/quiz', routeProtection, getQuizData);
courseRoute.put('/:courseId/topics/:topicId/progress', routeProtection, updateLessonProgress);

courseRoute.post('/:courseId/topics/:topicId/quiz/complete', routeProtection, completeQuiz);