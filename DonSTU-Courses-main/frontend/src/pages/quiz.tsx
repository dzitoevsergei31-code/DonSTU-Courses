// quiz.tsx
import { ChevronLeft, Clock, HelpCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { AuthContextType, Question as QuestionType, Quiz as QuizType } from '../@types';

interface UserAnswer {
  questionId: string;
  answer: number;
  isCorrect: boolean;
}

export const Quiz: React.FC = () => {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const { axios } = useContext(AuthContext) as AuthContextType;

  const getQuizData = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/courses/${courseId}/topics/${topicId}/quiz`);

      console.log(data);
      
      if (data.success) {
        setQuiz({...data.quiz, questionsCount: data.quiz.questions.length});
        setTimeLeft(data.quiz.timeLimit * 60);
      }
    } catch (error) {
      const message = (error as Error).message || 'Произошла ошибка';
      toast.error(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && topicId) {
      getQuizData();
    }
  }, [courseId, topicId]);

  // Таймер
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, quizCompleted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion: QuestionType | undefined = quiz?.questions[currentQuestionIndex];

  const checkAnswer = (): void => {
    if (!currentQuestion || selectedAnswer === null) return;

    let isCorrect = false;

    switch (currentQuestion.type) {
      case 'single':
        isCorrect = currentQuestion.correctAnswers.includes(selectedAnswer);
        break;
      default:
        isCorrect = false;
    }

    setIsAnswerCorrect(isCorrect);
    setShowExplanation(true);

    setUserAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect
    }]);

    if (isCorrect) {
      toast.success('Правильный ответ!');
    } else {
      toast.error('Неправильный ответ');
    }
  };

  const handleNextQuestion = (): void => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsAnswerCorrect(null);
    
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async (): Promise<void> => {
    if (!quiz) return;

    try {
      const correctAnswersCount = userAnswers.filter(answer => answer.isCorrect).length;
      const totalQuestions = quiz.questions.length;
      const score = Math.round((correctAnswersCount / totalQuestions) * 100);
      
      setFinalScore(score);
      setQuizCompleted(true);

      const { data } = await axios.post(`/api/courses/${courseId}/topics/${topicId}/quiz/complete`, {
        score,
        correctAnswers: correctAnswersCount,
        totalQuestions,
        timeSpent: (quiz.timeLimit * 60) - timeLeft,
        answers: userAnswers,
        quizId: quiz.id
      });

      if (data.success) {
        let successMessage = `Квиз завершен! Ваш результат: ${score}%`;
        
        if (data.awardedAchievements && data.awardedAchievements.length > 0) {
          successMessage += `\nПолучены достижения: ${data.awardedAchievements.join(', ')}`;
        }

        if (data.nextLesson) {
          successMessage += `\nОткрыт доступ к следующему уроку!`;
        }
        
        toast.success(successMessage);
        
        setTimeout(() => {
          navigate(`/courses/${courseId}`);
        }, 3000);
      }
    } catch (error) {
      const message = (error as Error).message || 'Произошла ошибка при завершении квиза';
      toast.error(message);
      console.error(message);
      setQuizCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Квиз не найден</h1>
          <Link 
            to={`/courses/${courseId}/topics/${topicId}`}
            className="text-[#003071] hover:underline"
          >
            Вернуться к уроку
          </Link>
        </div>
      </div>
    );
  }

  // Экран завершения квиза
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-[#0F0F0F] mb-4">
              Квиз завершен!
            </h1>
            
            <div className="bg-gradient-to-r from-[#003071] to-[#718FDD] text-white rounded-2xl p-6 max-w-md mx-auto mb-6">
              <div className="text-4xl font-bold mb-2">{finalScore}%</div>
              <div className="text-lg">
                Правильных ответов: {userAnswers.filter(a => a.isCorrect).length} из {quiz.questions.length}
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Поздравляем с завершением квиза! Вы будете перенаправлены на страницу урока...
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link 
                to={`/courses/${courseId}/topics/${topicId}`}
                className="px-6 py-3 bg-[#003071] text-white rounded-xl font-semibold hover:bg-[#718FDD] transition-colors duration-300"
              >
                Вернуться к уроку
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#718FDD]/10 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to={`/courses/${courseId}/topics/${topicId}`}
            className="group flex items-center space-x-3 text-[#003071] hover:text-[#718FDD] transition-colors duration-300"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Назад к уроку</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl px-4 py-2">
              <Clock className="w-5 h-5 text-[#9C27B0]" />
              <span className="font-mono font-semibold text-[#0F0F0F]">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl px-4 py-2">
              <span className="text-[#0F0F0F] font-semibold">
                Вопрос <span className="text-[#003071]">{currentQuestionIndex + 1}</span> из {quiz.questionsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Прогресс теста</span>
            <span>{Math.round(((currentQuestionIndex + 1) / quiz.questionsCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#003071] to-[#718FDD] h-3 rounded-full transition-all duration-1000"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questionsCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-8 mb-8 hover:shadow-xl transition-all duration-500">
            {/* ... существующий код вопроса ... */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0F0F0F] mb-3 leading-relaxed">
                  {currentQuestion.question}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Баллы: {currentQuestion.points}</span>
                  <span>•</span>
                  <span>Тип: {currentQuestion.type === 'single' && 'Одиночный выбор'}</span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = currentQuestion.correctAnswers.includes(index);
                const showCorrect = showExplanation && isCorrectAnswer;
                const showIncorrect = showExplanation && isSelected && !isCorrectAnswer;
                const showCorrectIndicator = showExplanation && isCorrectAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && setSelectedAnswer(index)}
                    disabled={showExplanation}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 group ${
                      showCorrectIndicator
                        ? 'bg-green-50 border-green-200 shadow-lg scale-105'
                        : showCorrect
                        ? 'bg-green-50 border-green-200 shadow-lg scale-105'
                        : showIncorrect
                        ? 'bg-red-50 border-red-200'
                        : isSelected
                        ? isAnswerCorrect === true
                          ? 'bg-green-50 border-green-200 shadow-lg scale-105'
                          : isAnswerCorrect === false
                          ? 'bg-red-50 border-red-200'
                          : 'bg-[#003071]/5 border-[#003071] shadow-lg scale-105'
                        : 'bg-white/50 border-[#718FDD]/20 hover:border-[#718FDD]/40 hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all duration-300 ${
                        showCorrectIndicator
                          ? 'bg-green-500 text-white'
                          : showCorrect
                          ? 'bg-green-500 text-white'
                          : showIncorrect
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? isAnswerCorrect === true
                            ? 'bg-green-500 text-white'
                            : isAnswerCorrect === false
                            ? 'bg-red-500 text-white'
                            : 'bg-[#003071] text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-[#003071] group-hover:text-white'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`text-lg font-medium leading-relaxed ${
                          showCorrectIndicator
                            ? 'text-green-800'
                            : showCorrect
                            ? 'text-green-800'
                            : showIncorrect
                            ? 'text-red-800'
                            : isSelected && isAnswerCorrect !== null
                            ? isAnswerCorrect
                              ? 'text-green-800'
                              : 'text-red-800'
                            : 'text-[#0F0F0F]'
                        }`}>
                          {option}
                        </p>
                      </div>

                      {/* Status Icons */}
                        <div className="flex-shrink-0">
                          {showExplanation ? (
                            // Показываем иконки только при показе объяснения
                            showCorrectIndicator || showCorrect ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500 animate-pulse" />
                            ) : showIncorrect ? (
                              <XCircle className="w-6 h-6 text-red-500 animate-pulse" />
                            ) : null
                          ) : (
                            // Показываем иконки при выборе ответа (до проверки)
                            isSelected && (
                              isAnswerCorrect === true ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500 animate-pulse" />
                              ) : isAnswerCorrect === false ? (
                                <XCircle className="w-6 h-6 text-red-500 animate-pulse" />
                              ) : (
                                <div className="w-6 h-6 bg-[#003071] rounded-full animate-pulse"></div>
                              )
                            )
                          )}
                        </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <div className="mt-8 p-6 bg-gradient-to-r from-[#003071]/5 to-[#718FDD]/5 rounded-xl border border-[#718FDD]/20 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-[#003071] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#0F0F0F] mb-2">Объяснение</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {!showExplanation ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
                className={`w-full sm:w-auto group flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  selectedAnswer === null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#003071] to-[#718FDD] text-white hover:shadow-lg hover:scale-105 hover:from-[#718FDD] hover:to-[#003071]'
                }`}
              >
                <span>Проверить ответ</span>
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                className="w-full sm:w-auto group flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#9C27B0] to-[#BA68C8] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 hover:from-[#BA68C8] hover:to-[#9C27B0] transition-all duration-300"
              >
                <span>
                  {currentQuestionIndex < quiz.questions.length - 1 ? 'Следующий вопрос' : 'Завершить квиз'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-gradient-to-r from-[#003071]/5 to-[#718FDD]/5 rounded-2xl border border-[#718FDD]/20 p-6">
          <h3 className="font-semibold text-[#0F0F0F] mb-3 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-[#003071]" />
            Советы по прохождению
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Внимательно читайте каждый вопрос перед выбором ответа</li>
            <li>• Используйте отведенное время рационально</li>
            <li>• Проверяйте ответы перед завершением теста</li>
            <li>• Не забудьте просмотреть объяснения для лучшего понимания</li>
          </ul>
        </div>
      </div>
    </div>
  );
};